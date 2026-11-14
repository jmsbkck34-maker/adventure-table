# Deploying Adventure Table to Vercel

Your adventure-table repository is now ready to deploy! Follow these steps:

## 1. Deploy to Vercel (Easiest)

**Option A: One-Click Deploy**
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/jmsbkck34-maker/adventure-table.git`
4. Click "Import"
5. Vercel will auto-detect React/build settings
6. Click "Deploy"
7. Done! Your game is live at `https://adventure-table-[random].vercel.app`

**Option B: Vercel CLI**
```bash
npm install -g vercel
cd C:\Users\jmsbl\OneDrive\Documents\adventure-table-work
vercel
# Follow the prompts
```

## 2. Play with Your Friends

Once deployed:
- Share the Vercel URL with your 3-5 players
- Open Discord in a browser window alongside
- Start playing!

## 3. Local Development

To test locally before deploying:

```bash
cd adventure-table-work
yarn install
yarn start
```

Open http://localhost:3000 in your browser.

## Features Available Now

✅ Battle maps with grid detection  
✅ Tokens and encounters  
✅ Fog of war  
✅ 3D dice roller  
✅ Drawing tools  
✅ Real-time player syncing via P2P  

## Next: D&D Beyond Integration

Want to add D&D Beyond character import? Let me know and I can add:
- Character sheet import
- Spell/ability references
- Monster manual access

## Troubleshooting

**Build fails?** Make sure you have:
- Node.js 14+ (`node --version`)
- Yarn 1.22+ (`yarn --version`)

**Memory issues?** The build uses 4GB RAM. If it fails:
1. Increase Docker memory to 5GB
2. Or deploy directly to Vercel (they handle it)

## Cost

- **Vercel:** Free tier covers 3-5 players easily
- **Database:** None needed - state is local + P2P
- **Hosting:** $0 for free tier, scales if needed
