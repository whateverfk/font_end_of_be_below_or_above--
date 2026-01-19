<template>
  <div class="h-full">
    <div class="h-full flex gap-6 overflow-hidden">
      <!-- Sidebar Navigation -->
      <div 
        class="glass-card flex flex-col overflow-hidden shrink-0 border-white/5 transition-all duration-300 relative"
        :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
      >
        <div class="p-4 border-b border-white/5 bg-white/[0.02]">
          <button
            @click="router.push('/')"
            class="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mb-4 whitespace-nowrap overflow-hidden"
          >
            <ArrowLeft class="w-4 h-4 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="text-xs font-bold uppercase tracking-widest">Back to Devices</span>
          </button>
          
          <div class="flex items-center justify-between gap-2 overflow-hidden">
            <h3 class="font-bold text-zinc-200 text-lg flex items-center gap-2 whitespace-nowrap">
              <Monitor class="w-5 h-5 text-teal-400 shrink-0" />
              <span v-if="!isSidebarCollapsed">Device Details</span>
            </h3>
            <button 
              @click="isSidebarCollapsed = !isSidebarCollapsed"
              class="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors shrink-0"
              :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
            >
              <ChevronLeft v-if="!isSidebarCollapsed" class="w-4 h-4" />
              <ChevronRight v-else class="w-4 h-4" />
            </button>
          </div>
          
          <p
            v-if="!isSidebarCollapsed && deviceStore.devices.find((d) => d.id == route.params.id)"
            class="text-[10px] text-zinc-500 mt-1 pl-7 truncate"
          >
            {{ deviceStore.devices.find((d) => d.id == route.params.id)?.ipNvr }}
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center p-3 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap overflow-hidden"
            :class="[
              activeTab === tab.id
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'hover:bg-white/5 text-zinc-400 border border-transparent',
              isSidebarCollapsed ? 'justify-center gap-0' : 'gap-3'
            ]"
            :title="isSidebarCollapsed ? tab.label : ''"
          >
            <component :is="tab.icon" class="w-4 h-4 shrink-0" />
            <span v-if="!isSidebarCollapsed">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden glass-card border-white/5 relative">
        <!-- Content Header -->
        <div
          class="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between"
        >
          <h2 class="text-2xl font-black text-zinc-100 italic tracking-tight uppercase">
            {{ tabs.find((t) => t.id === activeTab)?.label }}
          </h2>

          <!-- Actions (Sync Buttons based on Tab) -->
          <div class="flex gap-3">
            <button
              v-if="['info', 'storage', 'integration', 'users'].includes(activeTab)"
              @click="handleSync"
              :disabled="isLoading"
              class="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
              Sync {{ tabs.find((t) => t.id === activeTab)?.label }}
            </button>

            <!-- Sync All Users Special Button -->
            <button
              v-if="activeTab === 'users'"
              @click="handleSyncAllUsers"
              :disabled="permStore.loading.syncAll"
              class="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            >
              <Users class="w-4 h-4" />
              Sync All Users
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <!-- SYSTEM INFO -->
          <div v-if="activeTab === 'info'" class="max-w-3xl space-y-8">
            <div
              v-if="detailStore.loading.info && !detailStore.systemInfo"
              class="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p>Fetching system information...</p>
            </div>

            <div v-else-if="detailStore.systemInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-1">
                <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-500"
                  >Device Model</span
                >
                <p class="text-xl font-mono text-zinc-200">
                  {{ detailStore.systemInfo.model || 'N/A' }}
                </p>
              </div>
              <div class="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-1">
                <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-500"
                  >Serial Number</span
                >
                <p class="text-xl font-mono text-zinc-200">
                  {{ detailStore.systemInfo.serial_number || 'N/A' }}
                </p>
              </div>
              <div class="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-1">
                <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-500"
                  >Firmware Version</span
                >
                <p class="text-xl font-mono text-zinc-200">
                  {{ detailStore.systemInfo.firmware_version || 'N/A' }}
                </p>
              </div>
              <div class="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-1">
                <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-500"
                  >MAC Address</span
                >
                <p class="text-xl font-mono text-zinc-200">
                  {{ detailStore.systemInfo.mac_address || 'N/A' }}
                </p>
              </div>
            </div>

            <div
              v-else
              class="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl border-dashed"
            >
              <Info class="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <p class="text-zinc-500 mb-4">No system info available. Please sync from device.</p>
              <button
                @click="handleSync"
                class="px-6 py-2 bg-teal-500 text-zinc-950 font-bold rounded-xl hover:bg-teal-400 transition-colors"
              >
                Sync Now
              </button>
            </div>
          </div>

          <!-- STORAGE -->
          <div v-else-if="activeTab === 'storage'" class="space-y-6">
            <div
              v-if="detailStore.loading.storage && detailStore.storageList.length === 0"
              class="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p>Loading storage info...</p>
            </div>
            <div
              v-else-if="detailStore.storageList.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div
                v-for="hdd in detailStore.storageList"
                :key="hdd.hdd_id"
                class="p-5 bg-white/5 border border-white/5 rounded-xl space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-zinc-300">{{ hdd.hdd_name }}</span>
                  <span
                    class="text-xs px-2 py-1 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 uppercase font-black"
                    >{{ hdd.status }}</span
                  >
                </div>
                <div class="space-y-1 text-sm text-zinc-400">
                  <div class="flex justify-between">
                    <span>Type:</span> <span class="text-zinc-200">{{ hdd.hdd_type }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Property:</span> <span class="text-zinc-200">{{ hdd.property }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Capacity:</span>
                    <span class="text-zinc-200">{{ (hdd.capacity / 1024).toFixed(2) }} GB</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Free:</span>
                    <span class="text-zinc-200">{{ (hdd.free_space / 1024).toFixed(2) }} GB</span>
                  </div>
                </div>
                <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-teal-500"
                    :style="{ width: `${((hdd.capacity - hdd.free_space) / hdd.capacity) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl border-dashed"
            >
              <HardDrive class="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <p class="text-zinc-500">No storage devices found.</p>
            </div>
          </div>

          <!-- INTEGRATION (ONVIF) -->
          <div v-else-if="activeTab === 'integration'" class="space-y-6">
            <div
              v-if="detailStore.loading.onvif && detailStore.onvifUsers.length === 0"
              class="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p>Loading ONVIF users...</p>
            </div>
            <div v-else class="overflow-hidden bg-white/5 border border-white/5 rounded-2xl">
              <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-zinc-400 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th class="p-4">User ID</th>
                    <th class="p-4">Username</th>
                    <th class="p-4">Level</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr
                    v-for="user in detailStore.onvifUsers"
                    :key="user.user_id"
                    class="hover:bg-white/5 transition-colors"
                  >
                    <td class="p-4 font-mono text-zinc-500">{{ user.user_id }}</td>
                    <td class="p-4 font-bold text-zinc-200">{{ user.username }}</td>
                    <td class="p-4">
                      <span
                        class="px-2 py-1 rounded-md bg-zinc-800 border border-white/10 text-xs"
                        >{{ user.level }}</span
                      >
                    </td>
                  </tr>
                  <tr v-if="detailStore.onvifUsers.length === 0">
                    <td colspan="3" class="p-8 text-center text-zinc-500 italic">
                      No ONVIF users found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- USERS -->
          <div v-else-if="activeTab === 'users'" class="space-y-6">
            <div
              v-if="detailStore.loading.users && detailStore.deviceUsers.length === 0"
              class="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p>Loading device users...</p>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="deviceUser in detailStore.deviceUsers"
                :key="deviceUser.id"
                class="p-5 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-3 group"
              >
                <div class="flex items-center justify-between w-full">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-zinc-400"
                    >
                      {{ deviceUser.user_name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-zinc-200">{{ deviceUser.user_name }}</p>
                      <p class="text-xs text-zinc-500 capitalize">{{ deviceUser.role }}</p>
                    </div>
                  </div>
                  <div
                    class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border"
                    :class="
                      deviceUser.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    "
                  >
                    {{ deviceUser.is_active ? 'Active' : 'Inactive' }}
                  </div>
                </div>

                <!-- Permissions Button -->
                <button
                  @click="openPermissionModal(deviceUser)"
                  class="w-full py-2 text-xs font-bold text-zinc-400 bg-black/20 hover:bg-teal-500/10 hover:text-teal-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Shield class="w-3 h-3" />
                  Permissions
                </button>
              </div>
              <div
                v-if="detailStore.deviceUsers.length === 0"
                class="col-span-full p-8 text-center text-zinc-500 italic bg-white/5 rounded-xl border border-white/5 border-dashed"
              >
                No users found.
              </div>
            </div>
          </div>

          <!-- SYSTEM LOG -->
          <div v-else-if="activeTab === 'logs'" class="space-y-6 h-full flex flex-col">
            <!-- Filters -->
            <div
              class="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5"
            >
              <div class="flex flex-col gap-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500">From</label>
                <input
                  type="datetime-local"
                  v-model="fromIso"
                  class="bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500">To</label>
                <input
                  type="datetime-local"
                  v-model="toIso"
                  class="bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500">Log Type</label>
                <select
                  v-model="logsStore.majorType"
                  class="bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500/50 min-w-[120px]"
                >
                  <option value="ALL">All Types</option>
                  <option value="Alarm">Alarm</option>
                  <option value="Exception">Exception</option>
                  <option value="Operation">Operation</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] uppercase font-bold text-zinc-500">Limit</label>
                <select
                  v-model="logsStore.maxResults"
                  class="bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500/50"
                >
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                  <option :value="500">500</option>
                </select>
              </div>
              <button
                @click="searchLogs"
                class="mt-auto px-6 py-1.5 bg-teal-500 text-zinc-950 font-bold rounded hover:bg-teal-400 transition-colors text-sm flex items-center gap-2"
              >
                <Search class="w-4 h-4" />
                Search
              </button>
            </div>

            <!-- Table -->
            <div
              class="flex-1 overflow-hidden bg-white/5 border border-white/5 rounded-2xl flex flex-col"
            >
              <div class="overflow-y-auto custom-scrollbar flex-1">
                <table class="w-full text-left text-sm relative border-collapse">
                  <thead
                    class="sticky top-0 bg-zinc-900/90 backdrop-blur z-10 text-zinc-400 font-bold uppercase tracking-wider text-xs shadow-sm"
                  >
                    <tr>
                      <th class="p-4 border-b border-white/5">Time</th>
                      <th class="p-4 border-b border-white/5">Type (Major)</th>
                      <th class="p-4 border-b border-white/5">Content (Minor)</th>
                      <th class="p-4 border-b border-white/5 text-center">CH</th>
                      <th class="p-4 border-b border-white/5">User</th>
                      <th class="p-4 border-b border-white/5">IP</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">
                    <tr
                      v-for="(log, idx) in logsStore.logs"
                      :key="idx"
                      class="hover:bg-white/5 transition-colors"
                    >
                      <td class="p-3 font-mono text-zinc-500 text-xs whitespace-nowrap">
                        {{ log.time.replace('T', ' ') }}
                      </td>
                      <td class="p-3">
                        <span
                          class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-white/10"
                          :class="{
                            'bg-rose-500/10 text-rose-400 border-rose-500/20':
                              log.majorType === 'Alarm',
                            'bg-amber-500/10 text-amber-400 border-amber-500/20':
                              log.majorType === 'Exception',
                            'bg-blue-500/10 text-blue-400 border-blue-500/20':
                              log.majorType === 'Operation',
                          }"
                        >
                          {{ log.majorType }}
                        </span>
                      </td>
                      <td class="p-3 text-zinc-200 font-medium">
                        {{ logsStore.getMinorLabel(log.minorType) }}
                      </td>
                      <td class="p-3 text-center font-mono text-zinc-500 text-xs">
                        {{ log.localId || '-' }}
                      </td>
                      <td class="p-3 text-zinc-400">{{ log.userName }}</td>
                      <td class="p-3 font-mono text-zinc-500 text-xs">{{ log.ipAddress }}</td>
                    </tr>
                    <tr v-if="!logsStore.loading && logsStore.logs.length === 0">
                      <td colspan="6" class="p-10 text-center text-zinc-500 italic">
                        No logs found. Try adjusting filters.
                      </td>
                    </tr>
                    <tr v-if="logsStore.loading">
                      <td colspan="6" class="p-10 text-center text-teal-500 animate-pulse">
                        Loading logs...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                class="p-2 border-t border-white/5 bg-white/[0.02] text-xs text-zinc-500 text-right px-4"
              >
                Total Records: {{ logsStore.total }}
              </div>
            </div>
          </div>

          <!-- PLACEHOLDERS -->
          <!-- LIVE VIEW (Overhauled) -->
          <div v-else-if="activeTab === 'live'" class="h-full flex flex-col space-y-6">
            <div
              v-if="schedulerStore.loading.channels"
              class="flex flex-col items-center justify-center py-20 text-zinc-500"
            >
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-teal-500" />
              <p>Loading channels...</p>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
              <div
                v-for="channel in schedulerStore.channels"
                :key="channel.id"
                @click="openLiveModal(channel)"
                class="group aspect-video bg-white/5 border border-white/5 rounded-2xl hover:bg-teal-500/10 hover:border-teal-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-3 p-4"
              >
                <!-- Card Background/Visual -->
                <div class="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-500 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-all">
                  <Monitor class="w-6 h-6" />
                </div>
                
                <div class="text-center relative z-10">
                  <p class="font-bold text-zinc-300 group-hover:text-white transition-colors">
                    {{ channel.channel_name || `Channel ${channel.channel_no}` }}
                  </p>
                  <p class="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    CH {{ channel.channel_no }}
                  </p>
                </div>

                <!-- Hover Overlay -->
                <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <div class="bg-teal-500 text-zinc-950 p-1.5 rounded-lg shadow-lg">
                    <Play class="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="schedulerStore.channels.length === 0"
                class="col-span-full py-20 text-center border border-white/5 border-dashed rounded-3xl"
              >
                <Monitor class="w-12 h-12 mx-auto text-zinc-700 mb-4 opacity-50" />
                <p class="text-zinc-500">No channels available for this device.</p>
              </div>
            </div>
          </div>

          <!-- SCHEDULER -->
          <div v-else-if="activeTab === 'scheduler'" class="h-full flex flex-col space-y-4">
            <div class="flex gap-4 h-full">
              <!-- Channel List -->
              <div
                class="w-64 flex flex-col bg-white/5 border border-white/5 rounded-xl overflow-hidden shrink-0"
              >
                <div
                  class="p-3 border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Channels
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  <div
                    v-if="schedulerStore.loading.channels"
                    class="p-4 text-center text-teal-500 animate-pulse"
                  >
                    <Loader2 class="w-5 h-5 mx-auto animate-spin" />
                  </div>
                  <button
                    v-for="channel in schedulerStore.channels"
                    :key="channel.id"
                    @click="selectedChannelId = channel.id"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group"
                    :class="
                      selectedChannelId === channel.id
                        ? 'bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    "
                  >
                    <span class="truncate">{{
                      channel.channel_name || `Channel ${channel.channel_no}`
                    }}</span>
                    <Clock class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <div
                    v-if="!schedulerStore.loading.channels && schedulerStore.channels.length === 0"
                    class="p-4 text-center text-zinc-500 text-xs italic"
                  >
                    No channels found
                  </div>
                </div>
              </div>

              <!-- Timeline Area -->
              <div
                class="flex-1 bg-white/5 border border-white/5 rounded-xl flex flex-col relative overflow-hidden"
              >
                <div
                  class="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between"
                >
                  <h3 class="font-bold text-zinc-200">Recording Schedule</h3>

                  <!-- Legend -->
                  <div class="flex items-center gap-3">
                    <div
                      v-for="(cfg, key) in schedulerStore.MODE_CONFIG"
                      :key="key"
                      class="flex items-center gap-1.5"
                    >
                      <div
                        class="w-2.5 h-2.5 rounded-sm shadow-sm"
                        :class="{ [cfg.color]: true }"
                      ></div>
                      <span class="text-[10px] text-zinc-400 font-medium">{{ cfg.label }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 relative p-6 overflow-hidden flex flex-col justify-center">
                  <div
                    v-if="selectedChannelId && schedulerStore.channelModes[selectedChannelId]"
                    class="space-y-6"
                  >
                    <div
                      v-for="(day, dayIdx) in schedulerStore.DAYS"
                      :key="day"
                      class="flex items-center gap-4"
                    >
                      <div
                        class="w-24 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider"
                      >
                        {{ day }}
                      </div>
                      <div
                        class="flex-1 h-8 bg-black/40 rounded-lg relative overflow-hidden ring-1 ring-white/5"
                      >
                        <!-- Time Markers -->
                        <div
                          v-for="(seg, idx) in getDaySegments(selectedChannelId, dayIdx)"
                          :key="idx"
                          class="absolute top-0 bottom-0 h-full border-r border-black/10 transition-all hover:brightness-110 cursor-help"
                          :class="
                            schedulerStore.MODE_CONFIG[
                              seg.mode as keyof typeof schedulerStore.MODE_CONFIG
                            ]?.color || 'bg-zinc-700'
                          "
                          :style="{ left: `${seg.startPct}%`, width: `${seg.widthPct}%` }"
                          :title="`${seg.startTime} - ${seg.endTime} (${schedulerStore.MODE_CONFIG[seg.mode as keyof typeof schedulerStore.MODE_CONFIG]?.label})`"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Loading / Empty States -->
                  <div
                    v-else-if="selectedChannelId && schedulerStore.loading.mode"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm"
                  >
                    <Loader2 class="w-10 h-10 animate-spin text-teal-500 mb-2" />
                    <span class="text-zinc-500 text-sm animate-pulse">Fetching schedule...</span>
                  </div>
                  <div
                    v-else-if="!selectedChannelId"
                    class="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <Clock class="w-16 h-16 text-zinc-700 mb-4" />
                    <span class="text-zinc-500">Select a channel to view schedule</span>
                  </div>
                  <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-zinc-500">No schedule data available or sync required.</span>
                    <button
                      @click="handleSync"
                      class="mt-4 px-4 py-2 bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/20 text-sm font-bold"
                    >
                      Sync Channel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UserPermissionModal
      :is-open="showPermModal"
      :user="selectedUser"
      :device-id="deviceId"
      @close="showPermModal = false"
      @saved="notify('Saved', 'Permissions updated', 'success')"
    />

    <ChannelLiveModal
      :is-open="showLiveModal"
      :channel="selectedChannelForLive"
      :device-id="deviceId"
      @close="closeLiveModal"
      @saved="notify('Saved', 'Configuration applied', 'success')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeviceStore } from '../stores/devices'
import { useDeviceDetailStore } from '../stores/deviceDetail'
import { useDeviceLogsStore } from '../stores/deviceLogs'
import { useSchedulerStore } from '../stores/scheduler'
import { useLiveStore } from '../stores/live'
import { useDevicePermissionsStore } from '../stores/devicePermissions'
import UserPermissionModal from '../components/device/UserPermissionModal.vue'
import ChannelLiveModal from '../components/device/ChannelLiveModal.vue'
import {
  Monitor,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Info,
  Construction,
  Info as InfoIcon,
  HardDrive,
  Network,
  Users,
  FileText,
  Calendar,
  Search,
  Clock,
  Play,
  Square,
  Settings,
  Save,
  AlertTriangle,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()
const detailStore = useDeviceDetailStore()
const logsStore = useDeviceLogsStore()
const schedulerStore = useSchedulerStore()
const liveStore = useLiveStore()
const permStore = useDevicePermissionsStore()

const isSidebarCollapsed = ref(false)
const notify =
  inject<(title: string, msg: string, type: 'success' | 'error' | 'info') => void>('notify')!

const deviceId = route.params.id as string
const activeTab = ref('info')

const tabs = [
  { id: 'info', label: 'System Info', icon: InfoIcon },
  { id: 'live', label: 'Live View', icon: Monitor }, // Added Live View
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'integration', label: 'Integration', icon: Network },
  { id: 'logs', label: 'System Log', icon: FileText },
  { id: 'users', label: 'User & Permission', icon: Users },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar },
]

const isLoading = computed(() => {
  switch (activeTab.value) {
    case 'info':
      return detailStore.loading.info
    case 'storage':
      return detailStore.loading.storage
    case 'integration':
      return detailStore.loading.onvif
    case 'users':
      return detailStore.loading.users
    case 'logs':
      return logsStore.loading
    case 'scheduler':
      return (
        schedulerStore.loading.channels ||
        schedulerStore.loading.mode ||
        schedulerStore.loading.sync
      )
    case 'live':
      return liveStore.loading.config || liveStore.loading.update || liveStore.loading.sync
    default:
      return false
  }
})

onMounted(async () => {
  // Ensure devices are loaded for Sidebar Name lookup
  if (deviceStore.devices.length === 0) {
    await deviceStore.fetchDevices()
  }

  // Initial Fetch for Info
  if (activeTab.value === 'info') {
    fetchInfo()
  }
})

// Consolidated Tab Watcher
watch(activeTab, (tab) => {
  switch (tab) {
    case 'info':
      if (!detailStore.systemInfo) fetchInfo()
      break
    case 'storage':
      if (detailStore.storageList.length === 0) detailStore.fetchStorage(deviceId)
      break
    case 'integration':
      if (detailStore.onvifUsers.length === 0) detailStore.fetchOnvifUsers(deviceId)
      break
    case 'users':
      if (detailStore.deviceUsers.length === 0) detailStore.fetchDeviceUsers(deviceId)
      break
    case 'live':
    case 'scheduler':
      if (schedulerStore.channels.length === 0) schedulerStore.fetchChannels(deviceId)
      if (tab !== 'live') cleanupLive()
      break
  }

  if (tab !== 'live') {
    cleanupLive()
  }
})

const fetchInfo = async () => {
  try {
    await detailStore.fetchSystemInfo(deviceId)
  } catch (e) {}
}

const handleSync = async () => {
  try {
    if (activeTab.value === 'info') await detailStore.syncSystemInfo(deviceId)
    else if (activeTab.value === 'storage') await detailStore.syncStorage(deviceId)
    else if (activeTab.value === 'integration') await detailStore.syncOnvifUsers(deviceId)
    else if (activeTab.value === 'users') await detailStore.syncDeviceUsers(deviceId)
    else if (activeTab.value === 'scheduler') {
      if (selectedChannelId.value) {
        await schedulerStore.syncRecordingMode(deviceId, selectedChannelId.value)
      } else {
        notify('Info', 'Please select a channel to sync', 'info')
        return
      }
    }


    notify('Synced', 'Data updated from device', 'success')
  } catch (e) {
    notify('Error', 'Failed to sync data', 'error')
  }
}
// Date helpers for Input
const toIsoStringLocal = (d: Date) => {
  // Very basic ISO format YYYY-MM-DDTHH:mm to bind to input type="datetime-local"
  // Adjust for timezone offset
  const tzOffset = d.getTimezoneOffset() * 60000 // offset in milliseconds
  const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
  return localISOTime
}

const fromIso = ref(toIsoStringLocal(new Date(new Date().setDate(new Date().getDate() - 1))))
const toIso = ref(toIsoStringLocal(new Date()))

const searchLogs = async () => {
  // Update store dates from inputs
  logsStore.dateFrom = new Date(fromIso.value)
  logsStore.dateTo = new Date(toIso.value)

  try {
    await logsStore.fetchLogs(deviceId)
  } catch (e) {
    notify('Error', 'Failed to fetch logs', 'error')
  }
}

// Scheduler Logic
const selectedChannelId = ref<number | null>(null)

watch(selectedChannelId, (newId) => {
  if (newId) {
    schedulerStore.fetchRecordingMode(deviceId, newId)
  }
})

// Helper to convert HH:mm:ss to seconds
function timeToSeconds(t: string) {
  if (!t) return 0
  const [h, m, s] = t.split(':').map(Number)
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0)
}

function getDaySegments(channelId: number, dayIndex: number) {
  const data = schedulerStore.channelModes[channelId]
  if (!data || !data.timeline) return []

  // Filter segments for this day
  // The API might return day_start="0" (Mon) to day_end="0" (Mon)
  // Or crossing midnight? The spec example shows simple daily segments.
  // Assuming timeline items are already split by day or we filter by day_start == dayIndex

  const dayStr = String(dayIndex) // "0" to "6"
  return data.timeline
    .filter((t) => t.day_start === dayStr)
    .map((t) => {
      const startSec = timeToSeconds(t.time_start)
      const endSec = timeToSeconds(t.time_end)
      const totalSec = 86400

      const startPct = (startSec / totalSec) * 100
      const widthPct = ((endSec - startSec) / totalSec) * 100

      return {
        startPct,
        widthPct,
        mode: t.mode,
        startTime: t.time_start,
        endTime: t.time_end,
      }
    })
}

// Live View Logic (Overhauled)
const showLiveModal = ref(false)
const selectedChannelForLive = ref<any>(null)

function openLiveModal(channel: any) {
  selectedChannelForLive.value = channel
  showLiveModal.value = true
}

function closeLiveModal() {
  showLiveModal.value = false
  selectedChannelForLive.value = null
}

function cleanupLive() {
  // Logic moved to Modal
}


// User Permission Logic
const showPermModal = ref(false)
const selectedUser = ref<any>(null)

function openPermissionModal(user: any) {
  selectedUser.value = user
  showPermModal.value = true
}

async function handleSyncAllUsers() {
  try {
    await permStore.syncAllUsers(deviceId)
    // Refresh users list
    await detailStore.fetchDeviceUsers(deviceId)
    notify('Synced', 'All users and permissions synced', 'success')
  } catch (e) {
    notify('Error', 'Failed to sync all users', 'error')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
</style>
