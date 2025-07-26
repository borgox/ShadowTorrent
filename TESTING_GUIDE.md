# 🧪 ShadowTorrent Testing Guide

## 🚀 **Pre-Test Setup**

1. **Start the Application**
   ```bash
   cd "c:\Users\borse\Downloads\idk"
   npm run dev
   ```

2. **Wait for Both Processes**
   - Wait for React dev server to start (should show "compiled successfully")
   - Wait for Electron window to open
   - App should load without any console errors

---

## 📋 **COMPREHENSIVE TEST PLAN**

### **1. 🎯 Core Application Loading**
**Test**: Basic app startup
**Steps**:
- [ ] App window opens successfully
- [ ] Dark theme is applied correctly
- [ ] All UI components are visible (sidebar, main content, statistics)
- [ ] No console errors in development tools

**Expected**: Clean startup with dark UI

---

### **2. 🔧 Settings Functionality**
**Test**: Settings persistence and UI
**Steps**:
- [ ] Click "Settings" in sidebar
- [ ] Change download path to a test folder
- [ ] Toggle "Anonymous Mode" on/off
- [ ] Toggle "Enable DHT" on/off  
- [ ] Toggle "Enable PEX" on/off
- [ ] Toggle "Enable LSD" on/off
- [ ] Toggle "Drag & Drop Everywhere" on/off
- [ ] Set download limit to 1000 KB/s
- [ ] Set upload limit to 500 KB/s
- [ ] Click "Save Settings"
- [ ] **RESTART THE APP** (close and run `npm run dev` again)
- [ ] Verify all settings are preserved after restart

**Expected**: All settings save and restore correctly

---

### **3. 🧲 Magnet Link Support**
**Test**: Adding torrents via magnet links
**Steps**:
- [ ] Click "Add Torrent" in sidebar
- [ ] Use this test magnet link:
   ```
   magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com
   ```
- [ ] Paste the magnet link in the input field
- [ ] Click "Add Torrent"
- [ ] **IMPORTANT**: Check that the torrent appears in the list WITHOUT errors
- [ ] Verify the torrent shows "Loading metadata..." or similar initially
- [ ] Wait for metadata to load (torrent size should appear after a few seconds)
- [ ] Check that no "Expected a finite number" errors appear in console

**Expected**: Magnet link loads without JavaScript errors, metadata loads progressively

---

### **4. 🖱️ Drag & Drop Everywhere**
**Test**: Drag and drop functionality
**Steps**:
- [ ] Ensure "Drag & Drop Everywhere" is enabled in Settings
- [ ] Get a small .torrent file (you can create one or find a legal one)
- [ ] Try dragging the .torrent file to different areas of the app:
  - [ ] Main torrent list area
  - [ ] Sidebar area
  - [ ] Settings area
  - [ ] Statistics area
- [ ] Verify the torrent is added regardless of where you drop it
- [ ] Test with "Drag & Drop Everywhere" disabled - should only work in main area

**Expected**: Drag & drop works in all areas when enabled, restricted when disabled

---

### **5. 🖱️ Context Menu Functionality**
**Test**: Right-click menus work properly
**Steps**:
- [ ] Add at least one torrent (use magnet link from test 3)
- [ ] Right-click on the torrent in the list
- [ ] Verify context menu appears with options:
  - [ ] Start/Pause
  - [ ] Remove Torrent
  - [ ] Open File
  - [ ] Show in Folder
- [ ] Try each menu option:
  - [ ] Click "Pause" - torrent should pause
  - [ ] Right-click again, click "Start" - torrent should resume
  - [ ] Test "Remove Torrent" - should remove from list
- [ ] Add another torrent and test "Open File" and "Show in Folder"

**Expected**: All context menu actions work without errors

---

### **6. 💾 Persistence Between Sessions**
**Test**: Data survives app restarts
**Steps**:
- [ ] Add 2-3 different torrents (mix of magnet links and .torrent files if available)
- [ ] Start downloading at least one torrent
- [ ] Change some settings (download path, bandwidth limits)
- [ ] **CLOSE THE APP COMPLETELY**
- [ ] **RESTART THE APP** (`npm run dev`)
- [ ] Verify:
  - [ ] All torrents are still in the list
  - [ ] Download progress is preserved
  - [ ] Settings are still configured correctly
  - [ ] Active downloads resume automatically

**Expected**: Complete state restoration after restart

---

### **7. 📊 Statistics and UI Updates**
**Test**: Real-time statistics and progress
**Steps**:
- [ ] Have at least one active download running
- [ ] Click "Statistics" in sidebar
- [ ] Verify statistics update in real-time:
  - [ ] Download speed changes
  - [ ] Upload speed updates
  - [ ] Total downloaded increases
  - [ ] Connected peers count
- [ ] Go back to "Torrents" view
- [ ] Verify torrent progress bars update in real-time
- [ ] Check that download/upload speeds show correctly

**Expected**: All statistics update smoothly without errors

---

### **8. 🎨 UI and Theme Testing**
**Test**: Interface responsiveness and appearance
**Steps**:
- [ ] Resize the application window - UI should adapt
- [ ] Verify dark theme is consistent throughout:
  - [ ] Background colors are dark
  - [ ] Text is light and readable
  - [ ] Buttons and controls are properly styled
- [ ] Test hover effects on buttons and torrent rows
- [ ] Verify icons are properly displayed
- [ ] Check that progress bars are visible and properly colored

**Expected**: Consistent, responsive dark theme

---

### **9. 🔒 Security and Privacy Features**
**Test**: Privacy settings work correctly
**Steps**:
- [ ] Enable "Anonymous Mode" in settings
- [ ] Add a torrent and start downloading
- [ ] Verify the torrent client doesn't announce detailed client info
- [ ] Test DHT, PEX, LSD toggles by turning them off
- [ ] Verify the app doesn't make unexpected external connections
- [ ] Check that DevTools are disabled in production build (if you test production)

**Expected**: Privacy features work as intended

---

### **10. 🚨 Error Handling**
**Test**: App handles errors gracefully
**Steps**:
- [ ] Try adding an invalid magnet link
- [ ] Try adding a corrupted .torrent file
- [ ] Try setting an invalid download path
- [ ] Try extremely high bandwidth limits
- [ ] Disconnect from internet during download
- [ ] Reconnect internet - should resume

**Expected**: Graceful error handling, no crashes

---

## 🐛 **Bug Report Template**

If you find any issues, please report them in this format:

```
**Bug**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happened]

**Console Errors**: 
[Any error messages from browser dev tools]

**System**: [Windows/Mac/Linux version]
```

---

## ✅ **Test Results Checklist**

After completing all tests, check off:

- [ ] All tests passed without errors
- [ ] Magnet links load correctly (no "finite number" errors)
- [ ] Context menus work properly
- [ ] Drag & drop functions correctly
- [ ] Settings persist between restarts
- [ ] Torrents restore after app restart
- [ ] Real-time statistics work
- [ ] UI is responsive and properly themed
- [ ] Privacy features function correctly
- [ ] Error handling is graceful

**Status**: `[ ] READY FOR RELEASE` / `[ ] NEEDS FIXES`
