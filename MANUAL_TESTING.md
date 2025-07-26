# 🔧 ShadowTorrent Manual Testing Checklist

## 🚀 **Quick Start Test**

**First, run the app:**
```bash
cd "c:\Users\borse\Downloads\idk"
npm run dev
```

**Wait for:**
- ✅ React dev server: "compiled successfully"
- ✅ Electron window opens without errors
- ✅ Dark theme loaded correctly

---

## 🧪 **AUTOMATED TESTING**

**Run the automated test suite:**

1. **Open browser dev tools** in the Electron app (Ctrl+Shift+I)
2. **Go to Console tab**
3. **Copy and paste the test automation script:**
   ```javascript
   // Copy the entire content from test-automation.js
   ```
4. **Run the tests:**
   ```javascript
   const tester = new ShadowTorrentTester();
   tester.runAllTests();
   ```

**Expected:** All tests should pass with green checkmarks ✅

---

## 📋 **MANUAL TESTING CHECKLIST**

### **1. 🎯 Basic App Functionality**
- [ ] **App Startup**: Window opens without errors
- [ ] **Dark Theme**: All UI elements properly styled
- [ ] **Sidebar Navigation**: All menu items clickable
- [ ] **Console Clean**: No JavaScript errors on startup

### **2. 🔧 Settings Management**
- [ ] **Open Settings**: Click "Settings" in sidebar
- [ ] **Change Download Path**: Select a test folder
- [ ] **Toggle Privacy Options**:
  - [ ] Anonymous Mode on/off
  - [ ] Enable DHT on/off
  - [ ] Enable PEX on/off
  - [ ] Enable LSD on/off
- [ ] **Set Bandwidth Limits**:
  - [ ] Download limit: 1000 KB/s
  - [ ] Upload limit: 500 KB/s
- [ ] **Save Settings**: Click "Save Settings"
- [ ] **Restart Test**: Close app, restart, verify settings saved

### **3. 🧲 Magnet Link Testing**
- [ ] **Click "Add Torrent"**
- [ ] **Test Magnet Link** (copy this exactly):
  ```
  magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337
  ```
- [ ] **Paste and Add**: Should appear in torrent list
- [ ] **No Errors**: Check console for "Expected a finite number" errors
- [ ] **Metadata Loading**: Size should appear after few seconds

### **4. 🖱️ Context Menu Testing**
- [ ] **Right-click on torrent**: Context menu should appear
- [ ] **Test Menu Options**:
  - [ ] **Pause**: Should pause the torrent
  - [ ] **Resume**: Should resume the torrent
  - [ ] **Remove**: Should remove from list
  - [ ] **Open File**: Should work (if file exists)
  - [ ] **Show in Folder**: Should open file location

**CRITICAL:** All context menu actions should work without "torrent.destroy is not a function" errors

### **5. 🖱️ Drag & Drop Testing**
- [ ] **Enable Drag Everywhere**: Go to Settings, toggle on
- [ ] **Get a .torrent file**: Download any small legal torrent
- [ ] **Test Drag Areas**:
  - [ ] Main torrent list area
  - [ ] Sidebar area
  - [ ] Settings area (if enabled)
  - [ ] Statistics area (if enabled)
- [ ] **Disable Drag Everywhere**: Should only work in main area

### **6. 💾 Persistence Testing**
- [ ] **Add 2-3 torrents**: Mix of magnets and files
- [ ] **Start downloads**: At least one active
- [ ] **Modify settings**: Change some preferences
- [ ] **Close app completely**: Ctrl+Q or close window
- [ ] **Restart app**: `npm run dev`
- [ ] **Verify Restoration**:
  - [ ] All torrents still listed
  - [ ] Download progress preserved
  - [ ] Settings still applied
  - [ ] Active downloads resume

### **7. 📊 Statistics & Updates**
- [ ] **Go to Statistics**: Click in sidebar
- [ ] **Real-time Updates**: Numbers should change
- [ ] **Go to Torrents**: Progress bars update
- [ ] **Speed Display**: Shows current up/down speeds
- [ ] **Peer Count**: Shows connected peers

### **8. 🎨 UI Responsiveness**
- [ ] **Resize Window**: UI adapts properly
- [ ] **Hover Effects**: Buttons respond to mouse
- [ ] **Text Readability**: All text visible on dark background
- [ ] **Icon Display**: All icons render correctly

### **9. 🚨 Error Handling**
- [ ] **Invalid Magnet**: Try adding garbage text
- [ ] **Network Issues**: Disconnect internet, reconnect
- [ ] **Invalid Path**: Set non-existent download path
- [ ] **High Limits**: Set extreme bandwidth values

---

## 🐛 **Common Issues to Watch For**

### **Fixed Issues** (should NOT occur):
- ❌ "Expected a finite number, got undefined" errors
- ❌ "torrent.destroy is not a function" errors
- ❌ Context menus not working
- ❌ Settings not persisting
- ❌ Torrents disappearing after restart

### **Report if Found**:
- 🔍 JavaScript console errors
- 🔍 UI elements not responding
- 🔍 Data not saving/loading
- 🔍 Performance issues
- 🔍 Visual glitches

---

## ✅ **Success Criteria**

**ALL of these should work:**
- ✅ Magnet links load without errors
- ✅ Context menus work (pause/resume/remove)
- ✅ Settings persist between sessions
- ✅ Torrents restore after app restart
- ✅ Drag & drop functions correctly
- ✅ Real-time statistics update
- ✅ No JavaScript errors in console

## 📝 **Quick Test Script**

**5-Minute Quick Test:**
1. Start app → Check for errors ✅
2. Add magnet link → No "finite number" error ✅
3. Right-click torrent → Context menu works ✅
4. Change a setting → Save ✅
5. Restart app → Everything restored ✅

**If all 5 steps pass: Ready for release! 🚀**

---

## 🚦 **Test Status**

After completing tests, mark your status:

**STATUS:** `[ ] ALL TESTS PASS` / `[ ] ISSUES FOUND`

**Issues Found:**
```
- Issue 1: [Description]
- Issue 2: [Description]
```

**Ready for Production:** `[ ] YES` / `[ ] NO - NEEDS FIXES`
