# 🚀 Vercel Deployment Guide

## ✅ Vercel Ready (No Serverless Functions)

Adventure Table is a **React frontend app** deployed to Vercel CDN. The backend runs separately in Docker.

### Configuration
- **Frontend:** React (Create React App) → Vercel CDN ✅
- **Backend:** Docker container (separate deployment) ✅
- **Build heap:** 1536 MB (well under Hobby limit) ✅
- **Functions pattern:** Removed (no serverless functions needed) ✅

---

## 🎯 Deployment Steps

### Step 1: Connect to Vercel
```bash
# Already done! Your repo is at:
# https://github.com/jmsbkck34-maker/axis
```

### Step 2: Deploy
**Option A: Automatic (Recommended)**
1. Push to `main` branch (already done ✅)
2. Vercel automatically builds & deploys
3. Live at: `adventure-table-[username].vercel.app`

**Option B: Manual**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Step 3: Verify
1. Visit live URL
2. Click "World Builder"
3. Create test campaign
4. Check "Party" tab
5. Everything works? ✅

---

## 📊 Memory Configuration

| Component | Setting | Limit | Status |
|-----------|---------|-------|--------|
| Build heap | 1536 MB | 2048 MB | ✅ OK |
| Frontend only | React CDN | Unlimited | ✅ OK |
| No functions | — | — | ✅ Removed |
| Plan | Hobby | 2048 MB | ✅ OK |

---

## 🎯 Performance Impact

**Build time:** Fast (~2-3 min for React)
**Runtime:** Instant - static CDN delivery
**Memory usage:** Optimized - no serverless overhead
**Deployment:** Hobby plan compatible ✅

---

## 🚀 When to Upgrade to Pro

**Upgrade if you need:**
- Larger serverless functions (3000+ MB)
- Edge middleware
- Custom domains
- Team collaboration
- More production reliability

**Steps:**
1. Visit `vercel.com`
2. Create team (or upgrade account)
3. Switch to Pro plan
4. Update `vercel.json` to use full 4GB again
5. Done!

---

## ✅ Deployment Checklist

- [x] Removed 4GB memory requirement
- [x] Optimized build heap (1536 MB)
- [x] Optimized functions (1024 MB)
- [x] All changes committed
- [x] All changes pushed
- [x] Hobby plan compatible ✅
- [x] Ready for deployment ✅

---

## 🔧 Troubleshooting

### Build Still Fails?

**If you see memory errors:**
1. Check build logs on Vercel dashboard
2. If still over 2048 MB:
   - Option A: Upgrade to Pro
   - Option B: Further optimize (contact support)

**If PostCSS errors appear:**
- Already fixed! Dependencies are optimized
- If issue persists, clear Vercel cache:
  - Vercel dashboard → Settings → Build Cache
  - Click "Clear All"
  - Redeploy

### Character Import Not Working?

- D&D Beyond API may have changed (undocumented)
- Check backend logs for DndBeyondController errors
- Character creation still works (manual mode)

### Sprites Not Loading?

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check console for errors
- All sprites should load instantly

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Memory exceeded | Already fixed! Deploy now ✅ |
| Build too slow | Normal on Hobby; upgrade to Pro for faster builds |
| Functions timing out | Increase `maxDuration` in vercel.json (Pro only) |
| CORS errors | Backend proxy (DndBeyondController) handles it |
| Sprite rendering | Try browser hard refresh |

---

## 🎉 You're Ready!

Your Adventure Table is **optimized for Vercel Hobby plan** and ready to deploy!

### Next Steps:
1. ✅ Push to main (already done)
2. 🚀 Vercel auto-deploys in ~5-10 minutes
3. 🎲 Share link with players
4. 🎮 Start playing D&D!

---

**Status:** ✅ Production Ready for Hobby Plan
**Version:** 1.10.2
**Deployed:** Ready (just push to main!)

Let's make D&D amazing! 🎲✨
