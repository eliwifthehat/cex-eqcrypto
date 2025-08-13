# CEX Current Issues & Fixes Todo List

## 🔐 Authentication Issues
- [ ] **Fix double login requirement** - Users need to login twice to start session
- [ ] **Investigate session persistence** - Check if session cookies are being set correctly
- [ ] **Review authentication flow** - Ensure proper redirect after successful login
- [ ] **Test session timeout** - Verify sessions don't expire prematurely

## 📊 Trading Interface Issues
- [ ] **Add OrderBook component back** - Currently missing from trading interface
- [ ] **Add SentimentBar component back** - Currently missing from trading interface
- [ ] **Fix Buy/Sell buttons in desktop view** - Currently missing or not functioning
- [ ] **Verify OrderBook data loading** - Ensure real-time order book updates
- [ ] **Test SentimentBar functionality** - Ensure sentiment data is displaying correctly

## 📱 Mobile Layout Issues (To be addressed later)
- [ ] **Review mobile trading panel layout** - Check current mobile responsiveness
- [ ] **Fix mobile order placement** - Ensure buy/sell works on mobile
- [ ] **Optimize mobile navigation** - Check if all features are accessible on mobile
- [ ] **Test mobile order book display** - Ensure order book is readable on mobile
- [ ] **Verify mobile sentiment bar positioning** - Check if sentiment bar is visible on mobile

## 🔧 Technical Improvements
- [ ] **Check component imports** - Verify all trading components are properly imported
- [ ] **Review lazy loading** - Ensure components load correctly with Suspense
- [ ] **Test API connections** - Verify all trading APIs are connected properly
- [ ] **Check error boundaries** - Ensure proper error handling for failed component loads
- [ ] **Verify state management** - Check if trading state is managed correctly

## 🎯 Priority Order
1. **Fix double login issue** (High Priority - affects user experience)
2. **Add OrderBook back** (High Priority - essential for trading)
3. **Add SentimentBar back** (High Priority - important trading indicator)
4. **Fix Buy/Sell buttons** (High Priority - core trading functionality)
5. **Mobile layout fixes** (Medium Priority - can be addressed later)

## 🔍 Debugging Steps
- [ ] **Check browser console** for any JavaScript errors
- [ ] **Review network requests** to see if API calls are failing
- [ ] **Test in different browsers** to see if issues are browser-specific
- [ ] **Check component rendering** in React DevTools
- [ ] **Verify route protection** - Ensure protected routes work correctly

## 📝 Notes
- Focus on desktop functionality first
- Mobile layout can be addressed in a separate phase
- Authentication issues should be prioritized as they affect all users
- Trading interface components are critical for core functionality
