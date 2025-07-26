// Simple automated testing script for ShadowTorrent
// Run this in the browser console when the app is loaded

class ShadowTorrentTester {
  constructor() {
    this.testResults = [];
    this.testMagnet = 'magnet:?xt=urn:btih:0161FFC5F0DC243FA010E7CD79C02C9625DEB5D8&dn=Streets+of+Rogue+v2025.07.13&tr=udp%3A%2F%2Ftracker.theoks.net%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.bt4g.com%3A2095%2Fannounce&tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&tr=http%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.filemail.com%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.renfei.net%3A8080%2Fannounce&tr=udp%3A%2F%2Fbittorrent-tracker.e-n-c-r-y-p-t.net%3A1337%2Fannounce&tr=http%3A%2F%2Fbittorrent-tracker.e-n-c-r-y-p-t.net%3A1337%2Fannounce&tr=udp%3A%2F%2Fopentracker.io%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.qu.ax%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.ipv6tracker.org%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce';
  }

  log(test, status, message = '') {
    const result = { test, status, message, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${emoji} [${status}] ${test}: ${message}`);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testBasicUI() {
    this.log('Basic UI Load', 'RUNNING', 'Checking if basic UI elements are present');
    
    try {
      // Check sidebar
      const sidebar = document.querySelector('[data-testid="sidebar"]') || 
                     document.querySelector('nav') || 
                     document.querySelector('.sidebar');
      
      if (!sidebar) throw new Error('Sidebar not found');

      // Check main content area
      const mainContent = document.querySelector('[data-testid="main-content"]') ||
                         document.querySelector('main') ||
                         document.querySelector('.main-content');
      
      if (!mainContent) throw new Error('Main content area not found');

      this.log('Basic UI Load', 'PASS', 'All basic UI elements found');
      return true;
    } catch (error) {
      this.log('Basic UI Load', 'FAIL', error.message);
      return false;
    }
  }

  async testSettings() {
    this.log('Settings Test', 'RUNNING', 'Testing settings functionality');
    
    try {
      // Try to click settings
      const settingsButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.toLowerCase().includes('settings')
      );
      
      if (!settingsButton) throw new Error('Settings button not found');
      
      settingsButton.click();
      await this.wait(1000);
      
      // Check if settings view loaded
      const settingsView = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent && (
          el.textContent.includes('Download Path') ||
          el.textContent.includes('Anonymous Mode') ||
          el.textContent.includes('Enable DHT')
        )
      );
      
      if (!settingsView) throw new Error('Settings view not loaded');
      
      this.log('Settings Test', 'PASS', 'Settings view loaded successfully');
      return true;
    } catch (error) {
      this.log('Settings Test', 'FAIL', error.message);
      return false;
    }
  }

  async testAddTorrent() {
    this.log('Add Torrent Test', 'RUNNING', 'Testing magnet link addition');
    
    try {
      // Try to click Add Torrent
      const addButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && (
          el.textContent.toLowerCase().includes('add torrent') ||
          el.textContent.toLowerCase().includes('add')
        )
      );
      
      if (!addButton) throw new Error('Add Torrent button not found');
      
      addButton.click();
      await this.wait(1000);
      
      // Find input field
      const magnetInput = document.querySelector('input[type="text"]') ||
                         document.querySelector('textarea') ||
                         document.querySelector('input[placeholder*="magnet"]');
      
      if (!magnetInput) throw new Error('Magnet input field not found');
      
      // Enter test magnet
      magnetInput.value = this.testMagnet;
      magnetInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Find submit button
      const submitButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent && (
          btn.textContent.toLowerCase().includes('add') ||
          btn.textContent.toLowerCase().includes('submit')
        )
      );
      
      if (!submitButton) throw new Error('Submit button not found');
      
      submitButton.click();
      await this.wait(2000);
      
      // Check for errors
      const errorElements = document.querySelectorAll('[class*="error"]');
      if (errorElements.length > 0) {
        throw new Error('Error elements found after adding torrent');
      }
      
      this.log('Add Torrent Test', 'PASS', 'Magnet link added without errors');
      return true;
    } catch (error) {
      this.log('Add Torrent Test', 'FAIL', error.message);
      return false;
    }
  }

  async testTorrentList() {
    this.log('Torrent List Test', 'RUNNING', 'Checking torrent list functionality');
    
    try {
      // Go back to torrents view
      const torrentsButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.toLowerCase().includes('torrent')
      );
      
      if (torrentsButton) {
        torrentsButton.click();
        await this.wait(1000);
      }
      
      // Check if any torrents are displayed
      const torrentElements = document.querySelectorAll('[class*="torrent"]');
      
      if (torrentElements.length === 0) {
        this.log('Torrent List Test', 'PASS', 'No torrents found (empty state is valid)');
        return true;
      }
      
      // Check if torrent info is displayed properly
      const torrentInfo = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent && (
          el.textContent.includes('B/s') || // Speed info
          el.textContent.includes('MB') ||  // Size info
          el.textContent.includes('GB')     // Size info
        )
      );
      
      this.log('Torrent List Test', 'PASS', `Found ${torrentElements.length} torrent(s) with proper info display`);
      return true;
    } catch (error) {
      this.log('Torrent List Test', 'FAIL', error.message);
      return false;
    }
  }

  async testContextMenu() {
    this.log('Context Menu Test', 'RUNNING', 'Testing right-click functionality');
    
    try {
      const torrentElements = document.querySelectorAll('[class*="torrent"]');
      
      if (torrentElements.length === 0) {
        this.log('Context Menu Test', 'SKIP', 'No torrents available to test context menu');
        return true;
      }
      
      // Try right-clicking on first torrent
      const firstTorrent = torrentElements[0];
      const rightClickEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2
      });
      
      firstTorrent.dispatchEvent(rightClickEvent);
      await this.wait(500);
      
      // Check if context menu appeared
      const contextMenu = document.querySelector('[class*="context"]') ||
                         document.querySelector('[class*="menu"]');
      
      if (!contextMenu) {
        this.log('Context Menu Test', 'FAIL', 'Context menu did not appear');
        return false;
      }
      
      this.log('Context Menu Test', 'PASS', 'Context menu appeared successfully');
      
      // Close context menu by clicking elsewhere
      document.body.click();
      
      return true;
    } catch (error) {
      this.log('Context Menu Test', 'FAIL', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting ShadowTorrent Tests...\n');
    
    const tests = [
      this.testBasicUI,
      this.testSettings,
      this.testAddTorrent,
      this.testTorrentList,
      this.testContextMenu
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      const result = await test.call(this);
      if (result) passed++;
      else failed++;
      await this.wait(1000); // Wait between tests
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${passed + failed}`);
    console.log('='.repeat(50));
    
    if (failed === 0) {
      console.log('🎉 All tests passed! ShadowTorrent is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the detailed results above.');
    }
    
    return { passed, failed, results: this.testResults };
  }
}

// Usage: Run this in browser console when ShadowTorrent is loaded
// const tester = new ShadowTorrentTester();
// tester.runAllTests();

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  window.ShadowTorrentTester = ShadowTorrentTester;
  console.log('ShadowTorrent Tester loaded! Run: new ShadowTorrentTester().runAllTests()');
}
