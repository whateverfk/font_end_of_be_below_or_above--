# Device Management System - Development Specification

## HomeView

### Issues to Fix
- KHi click toggle update thành công nhưng không hiển thị lại thông tin mới ngay, có thể thêm 1 modal xác nhận nếu việc update UI khó update mượt mà
- Dù thành công nhưng vẫn hiện toast báo fail
- Thêm vào thông báo khi sai tài khoản mật khẩu lúc đăng nhập

### Registration Feature
Thêm vào màn hình đăng ký sử dụng khi bấm vào chữ "Contact support"

**API Endpoint:**
```
POST /api/auth/register

class RegisterDto(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)

def register(dto: RegisterDto, db: Session = Depends(get_db)):
    return {"token": create_jwt(user)}
```

---

## Alarm View

### Data Model
```python
class AlarmItem(BaseModel):
    id: int
    device_id: int | None
    event: str
    channel_id_in_device: str | None
    channel_name: str | None
    message: str
    created_at: datetime
```

### API Endpoints

#### Get Alarms (Cursor Pagination)
```
GET /api/user/alarm

Parameters:
- cursor_time: datetime | None
- cursor_id: int | None
- device_id: int | None (Query)
- event: str | None (Query)
- channel_id_in_device: str | None (Query)

Response (AlarmPage):
{
    "items": [
        {
            "id": int,
            "device_id": int | None,
            "device_ip_web": str,  // Thêm ip_web vào response
            "event": str,
            "channel_id_in_device": str | None,
            "channel_name": str | None,
            "message": str,
            "created_at": datetime
        }
    ],
    "next_cursor_time": datetime | None,
    "next_cursor_id": int | None,
    "has_more": bool
}

PAGE_SIZE = 25
```

#### Delete One Alarm
```
DELETE /api/user/alarm/{alarm_id}

Response:
{
    "detail": "Alarm deleted successfully"
}
```

#### Delete All Alarms
```
DELETE /api/user/alarm

Response:
{
    "detail": "All alarms deleted",
    "deleted_count": int
}
```

### Display Configuration
- **alarm.type** (Event, Priority) - Có thể loại bỏ
- **alarm.device** - Sử dụng ip_web
- **alarm.channel** - Dùng channel_id_in_device
- **View Footage** - Loại bỏ
- **alarm.time** - Dùng created_at

---

## Sync Setting

### Data Model
```python
class SyncSettingBase(BaseModel):
    is_enabled: bool
    interval_minutes: int

class SyncSettingOut(SyncSettingBase):
    class Config:
        from_attributes = True

class SyncSettingUpdate(BaseModel):
    is_enabled: bool
    interval_minutes: int
```

### API Endpoints

#### Sync Now
```
POST /api/sync/now

Response:
{
    "message": "Sync started"
}
```

#### Get Sync Setting
```
GET /api/sync/setting

Response (SyncSettingOut):
{
    "is_enabled": bool,
    "interval_minutes": int
}

Default nếu chưa có:
{
    "is_enabled": false,
    "interval_minutes": 60
}
```

#### Update Sync Setting
```
POST /api/sync/setting

Request (SyncSettingUpdate):
{
    "is_enabled": bool,
    "interval_minutes": int
}

Response:
{
    "message": "Saved"
}
```

### Sync Log
```python
class SyncLogOut(BaseModel):
    id: int
    device_id: int | None
    ip: str | None
    sync_time: datetime
    is_success: bool
    message: str

    class Config:
        from_attributes = True
```

#### Get Sync Logs
```
GET /api/logs

Response: list[SyncLogOut]

- Limit: 200 logs
- Order by: sync_time DESC
- Auto cleanup: Xóa logs cũ
```

---

## Monitor View

### API Endpoints

#### Get Month Data
```
GET /api/devices/{id}/channels/month_data/{date_str}

Parameters:
- date_str format: "YYYY-MM" (e.g., "2025-12")

Response:
{
    "oldest_record_month": "YYYY-MM" | None,
    "channels": [
        {
            "channel": {
                "id": int,
                "channel_no": int,
                "name": str,
                "oldest_record_date": datetime | None,
                "latest_record_date": datetime | None
            },
            "record_days": [
                {
                    "record_date": date,
                    "has_record": bool,
                    "time_ranges": [
                        {
                            "start_time": time,
                            "end_time": time
                        }
                    ]
                }
            ]
        }
    ]
}

Yêu cầu:
- Luôn hiển thị tất cả channels
```

### Monitor Configuration

#### Data Model
```python
class MonitorSettingBase(BaseModel):
    start_day: int = Field(ge=1, le=31, default=1)
    end_day: int = Field(ge=1, le=31, default=31)
    order: bool = False

class MonitorSettingCreate(MonitorSettingBase):
    pass

class MonitorSettingOut(MonitorSettingBase):
    id: int

    class Config:
        from_attributes = True
```

#### Get Monitor Setting
```
GET /api/config

Response (MonitorSettingOut):
{
    "id": int,
    "start_day": int,
    "end_day": int,
    "order": bool
}

Validation: start_day <= end_day
```

#### Update Monitor Setting
```
POST /api/config

Request (MonitorSettingCreate):
{
    "start_day": int,
    "end_day": int,
    "order": bool
}

Response (MonitorSettingOut)

Validation Error:
- start_day > end_day: "start_day <= end_day pls"
```

### Display Logic

**Color Coding:**
- **Xanh (Green)**: Ngày có time range đủ cả ngày
  - Điều kiện: starttime = "YYYY-MM-DD 00:00:00" AND endtime = "YYYY-MM-DD 23:59:59"
- **Đỏ (Red)**: Ngày có nhiều hơn 1 time range HOẶC 1 time range không đủ cả ngày
- **Tối/Xám (Dark/Gray)**: Ngày không có time range
  - Không thể click

**Interactivity:**
- Ngày có time range có thể click để hiện modal
- Ngày tối không thể click
- Giới hạn chuyển tháng trong vùng có dữ liệu (oldest_record_month)

---

## Device Detail View

### Tab Navigation
- Có thể dùng chuột kéo chứ không phải mỗi dùng nút mũi tên

### Tab: System Info

#### Data Model
```python
class DeviceSystemInfo(Base):
    __tablename__ = "device_system_info"

    device_id = Column(
        Integer, ForeignKey("devices.id", ondelete="CASCADE"),
        primary_key=True
    )
    model = Column(String(100))
    serial_number = Column(String(100))
    firmware_version = Column(String(50))
    mac_address = Column(String(50))
```

#### Get Device System Info
```
GET /api/device/{id}/infor

Response:
{
    "device_id": int,
    "model": str,
    "serial_number": str,
    "firmware_version": str,
    "mac_address": str
}

Error: 404 "System info not found, please sync first"
```

#### Sync Device System Info
```
POST /api/device/{id}/infor/sync

Response:
{
    "status": "ok",
    "source": "device",
    "data": {
        "model": str,
        "serial_number": str,
        "firmware_version": str,
        "mac_address": str
    }
}

Error: 502 "Failed to fetch system info from device"
```

**Note:** Xóa bỏ thông tin và field không cần thiết

---

### Tab: Storage

#### Data Model
```python
class DeviceStorage(Base):
    __tablename__ = "device_storage"

    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"))
    hdd_id = Column(Integer)
    hdd_name = Column(String(50))
    status = Column(String(20))
    hdd_type = Column(String(20))
    capacity = Column(Integer)
    free_space = Column(Integer)
    property = Column(String(10))  # RW / RO
```

#### Sync Device Storage
```
POST /api/device/{id}/infor/storage

Response:
{
    "status": "success",
    "count": int
}

Error: 502 "Cannot fetch storage from device"
```

#### Get Device Storage
```
GET /api/device/{id}/infor/storage

Response: [
    {
        "hdd_id": int,
        "hdd_name": str,
        "status": str,
        "hdd_type": str,
        "capacity": int,
        "free_space": int,
        "property": str
    }
]
```

**Feature:** Có nút để lấy thông tin mới nhất sử dụng API POST

---

### Tab: Integration

#### Data Model
```python
class DeviceIntegrationUser(Base):
    __tablename__ = "device_integration_users"

    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"))
    user_id = Column(Integer)
    username = Column(String(50))
    level = Column(String(20))   # admin / operator / user
```

#### Sync ONVIF Users
```
POST /api/device/{id}/infor/onvif-users

Response:
{
    "status": "success",
    "count": int
}

Error: 502 "Cannot fetch ONVIF users"
```

#### Get ONVIF Users
```
GET /api/device/{id}/infor/onvif-users

Response: [
    {
        "user_id": int,
        "username": str,
        "level": str
    }
]
```

**Feature:** Có nút để lấy thông tin mới nhất

---

### Tab: System Log

#### Request Model
```python
class DeviceLogRequest(BaseModel):
    from_: str = Field(..., alias="from")
    to: str
    maxResults: int = 100
    majorType: str = "ALL"

    class Config:
        validate_by_name = True
```

#### Fetch Device Logs
```
POST /api/logs/device/{device_id}

Request (DeviceLogRequest):
{
    "from": str (datetime),
    "to": str (datetime),
    "maxResults": int (default: 100, max: 2000),
    "majorType": str (default: "ALL")
}

Response:
{
    "device_id": int,
    "total": int,
    "logs": [
        {
            "time": datetime,
            "majorType": str,
            "minorType": str,
            "localId": str,
            "userName": str,
            "ipAddress": str
        }
    ]
}

Error: 502 "Failed to fetch logs from device"
```

#### UI Components
**2 DateTime Pickers:** Chọn khoảng ngày để search log
**1 Input Field:** Nhập giá trị tối đa (default: 100, max: 2000)
**1 Filter Dropdown:**
```html
<option value="ALL">All</option>
<option value="EXCEPTION">Exception</option>
<option value="ALARM">Alarm</option>
<option value="INFORMATION">Infomation</option>
<option value="OPERATION">Operation</option>
```

#### Minor Type Display Mapping
```python
MINOR_DISPLAY_MAP = {
    # Alarm
    "alarmOut": "Alarm Output",
    "alarmIn": "Alarm Input",
    
    "motionStart": "Start Motion Detection",
    "motionStop": "Stop Motion Detection",

    "hideStart": "Start Video Tampering",
    "hideStop": "Stop Video Tampering",

    "vcaStart": "Start VCA Alarm",
    "vcaStop": "Stop VCA Alarm",
    "remoteLogin": "Remote: Login",
    "remoteLogout": "Remote: Logout",

    "lineDetectionStart": "Line Crossing Detection Started",
    "lineDetectionStop": "Line Crossing Detection Stopped",
    "fieldDetectionStart": "Intrusion Detection Started",
    "fieldDetectionStop": "Intrusion Detection Stop",
    "audioInputExceptionStart": "Audio Input Exception Started",
    "audioInputExceptionStop": "Audio Input Exception Stop",
    "soundIntensityMutationStart": "Sudden change of Sound Intensity Detection Started",
    "soundIntensityMutationStop": "Sudden change of Sound Intensity Detection Stop",

    # Information
    "runStatusInfo": "System Running State",
    "hddInfo": "HDD information",

    # Exception
    "ipcDisconnect": "IP Camera Disconnect",
    "videoLost": "Video Signal Loss",
    "illlegealAccess": "Illegal Login",
    "netBroken": "Network Disconnected",
    "recordError": "Record/Capture Error",
    "hdFull": "HDD Full",
    "hdError": "HDD Error",
    "ipConflict": "IP Address Conflicted",
    "videoException": "Video Signal Exception",
    "videoFormatMismatch": "Input/Output Video Standard Mismatch",
    "ipcIpConfilict": "Ip Address of IPC Conflict",
    "viAndResMismatch": "Video resolution Mismatch",
    "spareException": "Hot Spare Exception",
    "startIpcMasException": "IPC Motion Analysis Exception",
    "anrRecordException": "ANR Record Exception",
    "recordOverFLow": "Record Buffer Overflow",
    "ipcmCrash": "IPCM Abnormal Reboot",
    "poePowerException": "POE Power Exception",
    "uploadDataCsException": "Data Upload Exception",
    "dialException": "Wireless Dial-Up Exception"
}
```

---

### Tab: User & Permission

#### Data Model
```python
class DeviceUser(Base):
    __tablename__ = "device_users"

    id = Column(Integer, primary_key=True)
    device_id = Column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(Integer)  # ID từ thiết bị (ISAPI)
    user_name = Column(String(50))
    role = Column(String(20))
    is_active = Column(Boolean, default=True)
    device = relationship(
        "Device",
        back_populates="users"
    )
    __table_args__ = (
        UniqueConstraint(
            "device_id", "user_id",
            name="uq_device_user"
        ),
    )
```

#### Sync Device Users
```
POST /api/device/{id}/user/sync

Response:
{
    "status": "success",
    "count": int
}

Error: 502 "Cannot fetch users from device"
```

#### Get Device Users
```
GET /api/device/{id}/user

Response: [
    {
        "id": int,
        "user_id": int,
        "user_name": str,
        "role": str,
        "is_active": bool
    }
]
```

**Feature:** Có 1 nút để lấy thông tin user mới nhất

---

### Tab: Scheduler

**Note:** Thêm 1 tab thiếu từ legacy - Sử dụng API tương tự legacy