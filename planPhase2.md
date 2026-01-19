# Device Management UI & API Specification

Tài liệu mô tả UI + API cho các tab: **Scheduler**, **Live View**, **User & Permission**, **Log**. Dùng để frontend triển khai và đối chiếu backend.

---

## 1. Tab Scheduler (Recording Schedule)

### 1.1 Constants & Lookup

```js
MODE_LABEL_MAP = {
  CMR: "Continuous",
  MOTION: "Motion",
  ALARM: "Alarm",
  EDR: "Motion | Alarm",
  ALARMANDMOTION: "Motion & Alarm",
  AllEvent: "Event"
}

DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday"
]
```

Mỗi **mode** có 1 **màu đại diện**, hiển thị kèm **lookup table** để người dùng đối chiếu màu ↔ mode.

---

### 1.2 API sử dụng

#### Lấy danh sách channel

```
GET /api/devices/{device_id}/channels
```

#### Lấy recording mode của 1 channel

```
GET /api/device/{device_id}/channels/recording-mode?channel_id={channel_id}
```

**Response**

```json
{
  "device_id": 1,
  "channel_id": 10,
  "channel_no": 1,
  "channel_name": "Camera 1",
  "schedule_enable": true,
  "default_mode": "CMR",
  "timeline": [
    {
      "day_start": "0",
      "time_start": "08:00:00",
      "day_end": "1",
      "time_end": "18:00:00",
      "mode": "MOTION"
    }
  ]
}
```

#### Sync recording mode từ NVR

```
POST /api/device/{device_id}/channels/recording-mode/sync?channel_id={channel_id}
```

---

### 1.3 UI Behavior

* Khi chọn **1 channel**:

  * Hiển thị **Default mode**
  * Hiển thị **bảng 7 ngày** (Monday → Sunday)
  * Mỗi ngày có **timeline** thể hiện các khoảng thời gian và mode
* Timeline hiển thị dạng **horizontal bar**, phân màu theo mode
* Có nút:

  * **Sync**: gọi API sync

---

## 2. Tab Live View

### 2.1 Cấu trúc UI

Tab gồm 2 phần:

1. **Live Player**
2. **Channel Configuration Panel**

---

### 2.2 Live Player

#### Stream URL (HLS)

```
{API_CONFIG}/api/device/{device_id}/channel/{channel_id}/live
```

#### Control API

* Khi:

  * chuyển channel
  * chuyển tab
  * chuyển view
  * tắt browser / tab

→ gửi:

```
POST /api/device/{device_id}/channel/{channel_id}/stop
```

* Heartbeat định kỳ:

```
POST /api/device/{device_id}/channel/{channel_id}/heartbeat
```

---

### 2.3 Channel Config Panel

#### API lấy thông tin channel

```
GET /api/device/{device_id}/channel/{channel_id}/infor
```

Nếu channel **chưa có config trong DB** → tự động sync từ device.

**Response fields**

* name
* resolution (width × height)
* video codec
* max frame rate
* fixed quality
* h265+
* vbr average / max
* motion detection

---

#### Update channel config

```
PUT /api/device/{device_id}/channel/{channel_id}/infor
```

* Commit DB trước
* Sau đó push config lên device
* Nếu push fail → trả warning (DB vẫn đã lưu)

---

#### Sync channel từ device

```
GET /api/device/{device_id}/channel/{channel_id}/sync
```

---

### 2.4 Capabilities (Giới hạn lựa chọn)

Ngoại trừ **name**, các field còn lại bị giới hạn theo capability từ device.

```
GET /api/device/{device_id}/channel/{channel_id}/capabilities
```

**Response**

```json
{
  "resolutions": [{"width":[1920,720], "height": [1080, 320]}],
  "video_codec": ["H.264", "H.265"],
  "max_frame_rates": [15, 20, 25],
  "fixed_quality": {
    "options": [20, 30, 45, 60, 75, 90],
    "current": 60,
    "default": 60
  },
  "vbr": {
    "upper_cap": {"min": 64, "max": 8192},
    "lower_cap": {"min": 512, "max": 512}
  }
}
```

---

### 2.5 Fixed Quality Labels

```js
FIXED_QUALITY_LABELS = {
  90: "Highest",
  75: "Higher",
  60: "Medium",
  45: "Low",
  30: "Lower",
  20: "Lowest"
}
```

---

## 3. Tab User & Permission

### 3.1 Sync toàn bộ user của device

```
POST /api/device/{id}/user/syncall
```

Dùng để sync **ALL users** từ device → DB.

---

### 3.2 Permission của 1 user

#### Lấy permission
SCOPE_PERMISSION_WHITELIST = {
    local: [
        "upgrade",
        "parameter_config",
        "restart_or_shutdown",
        "log_or_state_check",
        "manage_channel",
        "playback",
        "record",
        "backup",
        "ptz_control",
    ],
    remote: [
        "parameter_config",
        "log_or_state_check",
        "upgrade",
        "voice_talk",
        "restart_or_shutdown",
        "alarm_out_or_upload",
        "control_local_out",
        "transparent_channel",
        "manage_channel",
        "preview",
        "record",
        "playback",
        "ptz_control",
    ],
};

CHANNEL_BASED_PERMISSIONS = [
    "preview",
    "playback",
    "record",
    "backup",
    "ptz_control",
];

PERMISSION_LABELS = {
    upgrade: "Upgrade / Format",
    parameter_config: "Parameter Configuration",
    restart_or_shutdown: "Shutdown / Reboot",
    log_or_state_check: "Log / Status Check",
    manage_channel: "Camera Management",
    playback: "Playback",
    record: "Manual Record",
    backup: "Video Export",
    ptz_control: "PTZ Control",
    preview: "Live View",
    voice_talk: "Two-way Audio",
    alarm_out_or_upload: "Notify Surveillance Center / Trigger Alarm Output",
    control_local_out: "Video Output Control",
    transparent_channel: "Serial Port Control",
};

```
GET /api/device/{id}/user/{device_user_id}/permissions
```

* Nếu DB chưa có → tự fetch từ device

**Response structure**

```json
{
  "local": {
    "global": {"preview": true},
    "channels": {
      "playback": [1,2,3]
    }
  },
  "remote": {
    "global": {},
    "channels": {}
  }
}
```

---

#### Sync permission cho 1 user

```
POST /api/device/{id}/user/{device_user_id}/permissions/sync
```

---

#### Update permission

```
PUT /api/device/{id}/user/{device_user_id}/permissions
```

* Modal permission có:

  * Checkbox global permission
  * Checkbox channel permission (hiện danh sách channel khi click)
* Nút **Save** → gọi PUT
* Nếu LOW_PRIVILEGE → hiển thị message tương ứng

---

## 4. Tab Log

### 4.1 UI Requirement

* Có field **Limit**:

  * User nhập tay **hoặc** chọn preset
  * Điều kiện: `limit <= 2000`
* Hiển thị thêm:

  * **Channel No (localId)**
  * Nếu dài → hiển thị dạng **overflow / ellipsis**

---

## 5. Ghi chú chung

* Mọi tab đều có **nút Sync** và **nút Save** (nếu có chỉnh sửa)
* Sync luôn ưu tiên **Device → DB**
* Save ưu tiên **DB → Device**
* Khi push device fail: DB vẫn là source of truth và cảnh báo frontend

---

**End of document**
