/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official
 * ╚══════════════
 * 
 * @author Habibih Official
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import { sendInteractive } from '../tombol.js'
import { settings } from '../../config/settings.js'
import { rupiah, number } from './format.js'

const WIDTH = 1280
const HEIGHT = 860
const FONT = 'Arial'

const THEMES = {
  adventure: { bg: '#0f1013', surface: '#181a1f', raised: '#20232a', dark: '#0b0c0f', accent: '#b8a8ff', accent2: '#8fd7e8', soft: '#d4d7de', ink: '#f5f6f8', muted: '#9da3ad', glow: 'rgba(184,168,255,0.16)', success: '#8fd0b1', danger: '#e9a0b0', gold: '#e3c37a' },
  fishing: { bg: '#0d1114', surface: '#151b20', raised: '#1e272d', dark: '#090d10', accent: '#91d9ea', accent2: '#b6eef7', soft: '#d2dbe0', ink: '#f5f8fa', muted: '#9aa9b0', glow: 'rgba(145,217,234,0.17)', success: '#91d1b3', danger: '#e7a0ad', gold: '#e1c67e' },
  hunt: { bg: '#0e120f', surface: '#171d18', raised: '#222b23', dark: '#0a0e0b', accent: '#a8d39e', accent2: '#d2d8a2', soft: '#d5ddd4', ink: '#f4f7f3', muted: '#9eaa9f', glow: 'rgba(168,211,158,0.16)', success: '#9bd5b5', danger: '#e5a2a4', gold: '#ddc27c' },
  mining: { bg: '#101114', surface: '#191c21', raised: '#242930', dark: '#0b0d10', accent: '#b5c5e8', accent2: '#91ddd3', soft: '#d4d8df', ink: '#f5f6f8', muted: '#9da4ae', glow: 'rgba(145,221,211,0.16)', success: '#98d2b1', danger: '#e5a1aa', gold: '#e1c67f' },
  boss: { bg: '#130f12', surface: '#1d171b', raised: '#282026', dark: '#0d0a0d', accent: '#e0a5ba', accent2: '#c5a7ef', soft: '#ddd5da', ink: '#fff7fb', muted: '#a79ba3', glow: 'rgba(224,165,186,0.17)', success: '#9bd3b2', danger: '#f0a4b6', gold: '#e1c17b' },
  battle: { bg: '#111014', surface: '#1b1920', raised: '#25222d', dark: '#0b0a0e', accent: '#b9adf4', accent2: '#e1a6cf', soft: '#dcd8e2', ink: '#f9f7fb', muted: '#a49fac', glow: 'rgba(185,173,244,0.17)', success: '#98d2b0', danger: '#e8a2b5', gold: '#e1c27d' },
  shop: { bg: '#120f14', surface: '#1b1720', raised: '#26202c', dark: '#0c0a0f', accent: '#d0a9e8', accent2: '#91d7e7', soft: '#ddd5e2', ink: '#fff9ff', muted: '#a69ba9', glow: 'rgba(208,169,232,0.16)', success: '#98d2b0', danger: '#e6a2b5', gold: '#e1c27b' },
  leaderboard: { bg: '#12110e', surface: '#1c1a15', raised: '#28251d', dark: '#0c0b09', accent: '#e3c57c', accent2: '#b8c7ee', soft: '#dedbd2', ink: '#fffdf7', muted: '#a9a397', glow: 'rgba(227,197,124,0.16)', success: '#9bd2b0', danger: '#e7a1b3', gold: '#f0cc79' },
  inventory: { bg: '#0e1114', surface: '#171b20', raised: '#22282e', dark: '#090c0f', accent: '#9ed8e9', accent2: '#b5c4ef', soft: '#d4dbe0', ink: '#f7f9fa', muted: '#9da7af', glow: 'rgba(158,216,233,0.16)', success: '#98d2b0', danger: '#e6a1b2', gold: '#dfc17c' },
  profile: { bg: '#101014', surface: '#19191f', raised: '#24242d', dark: '#0b0b0f', accent: '#bdb0f4', accent2: '#9bd8ea', soft: '#d9d7e0', ink: '#faf9fc', muted: '#a09da9', glow: 'rgba(189,176,244,0.17)', success: '#98d2b0', danger: '#e6a1b3', gold: '#e1c27c' },
  reward: { bg: '#111013', surface: '#1a181e', raised: '#25222b', dark: '#0b0a0d', accent: '#c3a9ef', accent2: '#9adce9', soft: '#dad6e0', ink: '#fcfaff', muted: '#a29ca9', glow: 'rgba(195,169,239,0.17)', success: '#99d2b0', danger: '#e5a1b4', gold: '#e3c47d' },
  levelup: { bg: '#120f15', surface: '#1b1721', raised: '#27202f', dark: '#0c0a0f', accent: '#c7a7f3', accent2: '#9fe0ef', soft: '#ded8e4', ink: '#fffaff', muted: '#a59daa', glow: 'rgba(199,167,243,0.18)', success: '#9ad4b2', danger: '#e7a2b5', gold: '#e4c47d' },
  work: { bg: '#101113', surface: '#191b1f', raised: '#23262c', dark: '#0b0c0f', accent: '#aebfe3', accent2: '#a9c6e8', soft: '#d7dbe1', ink: '#f8f9fa', muted: '#9fa5ad', glow: 'rgba(174,191,227,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#dec17c' },
  daily: { bg: '#12110e', surface: '#1c1a16', raised: '#28251e', dark: '#0c0b09', accent: '#e0c17b', accent2: '#c0afe9', soft: '#ddd9d0', ink: '#fffdf8', muted: '#a59f94', glow: 'rgba(224,193,123,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#edcb7b' },
  hourly: { bg: '#0e1113', surface: '#171b1e', raised: '#22272b', dark: '#090c0e', accent: '#9ecfe0', accent2: '#b8b0ea', soft: '#d4d9dd', ink: '#f8fafb', muted: '#9da7ad', glow: 'rgba(158,207,224,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#dfc17c' },
  berburu: { bg: '#0e120f', surface: '#171c18', raised: '#222a23', dark: '#0a0e0b', accent: '#a7d19e', accent2: '#d4c98f', soft: '#d5ddd4', ink: '#f6f9f5', muted: '#9ea99f', glow: 'rgba(167,209,158,0.16)', success: '#98d2b0', danger: '#e5a1a3', gold: '#dfc27c' },
  expedition: { bg: '#0b0c10', surface: '#191c23', raised: '#242933', dark: '#0b0d10', accent: '#b3c1e7', accent2: '#9fd6e5', soft: '#d6dae1', ink: '#f7f8fb', muted: '#9fa6b1', glow: 'rgba(179,193,231,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#e0c27d' },
}

function themeFor(type) {
  const aliases = { training: 'work', bank: 'daily', quest: 'expedition' }
  return THEMES[type] || THEMES[aliases[type]] || THEMES.reward
}

function cleanText(value, fallback = '') {
  return String(value ?? fallback).replace(/[\r\n]+/g, ' ').trim()
}

function clampText(value, max = 30) {
  const text = cleanText(value)
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text
}

function roundRect(ctx, x, y, w, h, r, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

function raised(ctx, x, y, w, h, r, theme, depth = 10) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.48)'
  ctx.shadowBlur = depth * 1.45
  ctx.shadowOffsetX = depth * 0.7
  ctx.shadowOffsetY = depth * 0.72
  roundRect(ctx, x, y, w, h, r, theme.surface)
  ctx.restore()
  ctx.save()
  ctx.shadowColor = 'rgba(255,255,255,0.11)'
  ctx.shadowBlur = depth * 1.15
  ctx.shadowOffsetX = -depth * 0.58
  ctx.shadowOffsetY = -depth * 0.58
  roundRect(ctx, x, y, w, h, r, theme.surface)
  ctx.restore()
  roundRect(ctx, x, y, w, h, r, null, 'rgba(255,255,255,0.09)', 1)
}

function inset(ctx, x, y, w, h, r, theme, depth = 8) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.42)'
  ctx.shadowBlur = depth * 1.3
  ctx.shadowOffsetX = depth * 0.62
  ctx.shadowOffsetY = depth * 0.64
  roundRect(ctx, x, y, w, h, r, theme.dark)
  ctx.restore()
  ctx.save()
  ctx.shadowColor = 'rgba(255,255,255,0.10)'
  ctx.shadowBlur = depth * 1.1
  ctx.shadowOffsetX = -depth * 0.5
  ctx.shadowOffsetY = -depth * 0.5
  roundRect(ctx, x, y, w, h, r, theme.dark)
  ctx.restore()
  roundRect(ctx, x, y, w, h, r, null, 'rgba(255,255,255,0.07)', 1)
}

function text(ctx, value, x, y, size, color, weight = 'normal', align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(cleanText(value), x, y)
}

function glow(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function spark(ctx, x, y, r, color, alpha = 0.7) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  line(ctx, x - r, y, x + r, y, color, 2)
  line(ctx, x, y - r, x, y + r, color, 2)
  ctx.restore()
}

function badge(ctx, x, y, label, theme, accent = theme.accent) {
  const value = clampText(label, 15).toUpperCase()
  ctx.font = `bold 12px ${FONT}`
  const w = Math.max(92, ctx.measureText(value).width + 36)
  raised(ctx, x, y, w, 34, 17, theme, 5)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x + 18, y + 17, 4, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, value, x + 31, y + 21, 11, theme.soft, 'bold')
}

function grid(ctx, x, y, w, h, theme, step = 28) {
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = theme.soft
  for (let yy = y + 10; yy < y + h; yy += step) {
    for (let xx = x + 10; xx < x + w; xx += step) {
      ctx.beginPath()
      ctx.arc(xx, yy, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function sceneFrame(ctx, x, y, w, h, theme) {
  inset(ctx, x, y, w, h, 36, theme, 12)
  roundRect(ctx, x + 12, y + 12, w - 24, h - 24, 29, null, 'rgba(255,255,255,0.075)', 1)
}

function drawWater(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#222d33')
  g.addColorStop(0.55, '#151f24')
  g.addColorStop(1, '#0a1115')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  for (let i = 0; i < 7; i++) {
    const yy = y + h * 0.54 + i * 34
    ctx.globalAlpha = 0.28 - i * 0.025
    ctx.strokeStyle = theme.accent2
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x + 30, yy)
    ctx.quadraticCurveTo(x + w * 0.24, yy - 12, x + w * 0.45, yy)
    ctx.quadraticCurveTo(x + w * 0.68, yy + 12, x + w - 30, yy - 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawCharacter(ctx, cx, cy, scale, theme, pose = 'idle') {
  const s = scale
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)

  ctx.fillStyle = 'rgba(0,0,0,0.36)'
  ctx.beginPath()
  ctx.ellipse(0, 88, 54, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#e5ad8a'
  ctx.beginPath()
  ctx.arc(0, -48, 27, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#302638'
  ctx.beginPath()
  ctx.arc(0, -57, 28, Math.PI * 1.05, Math.PI * 2.02)
  ctx.fill()
  ctx.fillStyle = '#241e2a'
  ctx.beginPath()
  ctx.arc(-18, -49, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.arc(18, -49, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f2d0a9'
  ctx.beginPath()
  ctx.arc(-9, -45, 2.5, 0, Math.PI * 2)
  ctx.arc(9, -45, 2.5, 0, Math.PI * 2)
  ctx.fill()

  const coat = pose === 'hunter' ? '#6d8c7b' : pose === 'miner' ? '#71839e' : pose === 'battle' ? '#7565a5' : '#7d70a5'
  const trim = pose === 'hunter' ? '#b7c9a5' : pose === 'miner' ? '#c2cbd9' : '#c6b8e8'
  roundRect(ctx, -31, -18, 62, 80, 20, coat)
  roundRect(ctx, -26, -10, 52, 67, 17, 'rgba(255,255,255,0.055)')
  ctx.fillStyle = trim
  ctx.fillRect(-4, -11, 8, 68)
  ctx.fillStyle = '#4b3c50'
  roundRect(ctx, -29, 42, 58, 10, 5, ctx.fillStyle)
  ctx.fillStyle = '#d5a37f'
  roundRect(ctx, -44, -6, 15, 52, 8, ctx.fillStyle)
  roundRect(ctx, 29, -6, 15, 52, 8, ctx.fillStyle)
  ctx.fillStyle = '#27212d'
  roundRect(ctx, -28, 57, 23, 48, 9, ctx.fillStyle)
  roundRect(ctx, 5, 57, 23, 48, 9, ctx.fillStyle)
  ctx.fillStyle = '#4f435a'
  roundRect(ctx, -31, 99, 29, 9, 5, ctx.fillStyle)
  roundRect(ctx, 2, 99, 29, 9, 5, ctx.fillStyle)

  if (pose === 'fishing') {
    ctx.strokeStyle = '#d8b487'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(28, -4)
    ctx.quadraticCurveTo(66, -26, 95, -66)
    ctx.stroke()
    ctx.strokeStyle = '#d6f4ff'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(95, -66)
    ctx.quadraticCurveTo(85, 18, 103, 72)
    ctx.stroke()
    ctx.fillStyle = theme.accent2
    ctx.beginPath()
    ctx.arc(103, 72, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#d5a37f'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(25, 4)
    ctx.lineTo(45, -8)
    ctx.stroke()
  } else if (pose === 'miner') {
    ctx.fillStyle = '#5f6d82'
    ctx.beginPath()
    ctx.arc(0, -65, 31, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e4c37d'
    roundRect(ctx, -8, -78, 16, 8, 4, ctx.fillStyle)
    ctx.fillStyle = '#d9e5f1'
    ctx.beginPath()
    ctx.arc(0, -66, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#a98a65'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(24, 4)
    ctx.lineTo(69, -52)
    ctx.stroke()
    ctx.strokeStyle = '#c4ced9'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(48, -27)
    ctx.lineTo(76, -55)
    ctx.stroke()
  } else if (pose === 'hunter') {
    ctx.strokeStyle = '#b98e65'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(47, 6, 44, -1.18, 1.18)
    ctx.stroke()
    ctx.strokeStyle = '#d5b187'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(42, -35)
    ctx.lineTo(49, 43)
    ctx.stroke()
    ctx.fillStyle = '#3d3431'
    roundRect(ctx, -43, -9, 10, 44, 5, ctx.fillStyle)
    ctx.strokeStyle = '#c8aa7b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-37, -6)
    ctx.lineTo(-37, 28)
    ctx.stroke()
  } else if (pose === 'battle') {
    ctx.fillStyle = '#6f7287'
    roundRect(ctx, -52, -2, 20, 54, 8, ctx.fillStyle)
    ctx.strokeStyle = '#dce6ef'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(29, -2)
    ctx.lineTo(79, -60)
    ctx.stroke()
    ctx.strokeStyle = '#8c6748'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(48, -23)
    ctx.lineTo(26, -3)
    ctx.stroke()
    ctx.fillStyle = '#d8c18a'
    ctx.beginPath()
    ctx.arc(-42, 24, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawFish(ctx, x, y, scale, theme) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = theme.accent2
  ctx.beginPath()
  ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-27, 0)
  ctx.lineTo(-50, -18)
  ctx.lineTo(-50, 18)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#09212a'
  ctx.beginPath()
  ctx.arc(16, -3, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTree(ctx, x, y, scale, theme) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#4a3328'
  roundRect(ctx, -10, 0, 20, 80, 8, ctx.fillStyle)
  ctx.fillStyle = theme.accent
  for (const p of [[0, -50, 42], [-30, -15, 34], [31, -18, 36], [0, 5, 44]]) {
    ctx.beginPath()
    ctx.arc(p[0], p[1], p[2], 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawStars(ctx, x, y, w, h, theme, count = 28) {
  ctx.save()
  for (let i = 0; i < count; i++) {
    const px = x + ((i * 83) % Math.max(1, Math.floor(w - 20))) + 10
    const py = y + ((i * 47) % Math.max(1, Math.floor(h * 0.58))) + 8
    const r = i % 5 === 0 ? 2 : 1
    ctx.fillStyle = i % 3 === 0 ? theme.accent2 : 'rgba(255,255,255,0.55)'
    ctx.globalAlpha = 0.35 + (i % 4) * 0.12
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawClouds(ctx, x, y, w, h) {
  ctx.save()
  ctx.fillStyle = 'rgba(235,240,245,0.06)'
  for (const c of [[0.18,0.2,110],[0.42,0.13,80],[0.75,0.25,125]]) {
    const cx=x+w*c[0], cy=y+h*c[1], r=c[2]
    ctx.beginPath()
    ctx.arc(cx-r*0.45,cy,r*0.38,0,Math.PI*2)
    ctx.arc(cx,cy-r*0.12,r*0.5,0,Math.PI*2)
    ctx.arc(cx+r*0.45,cy,r*0.34,0,Math.PI*2)
    ctx.fill()
  }
  ctx.restore()
}

function drawGroundPlants(ctx, x, y, w, h, theme, count = 12) {
  ctx.save()
  for (let i=0;i<count;i++) {
    const px=x+20+((i*71)%(Math.max(1,Math.floor(w-40))))
    const py=y+h*0.78+((i%3)*8)
    const s=10+(i%4)*4
    ctx.strokeStyle=i%2?theme.accent2:'rgba(190,205,190,0.48)'
    ctx.lineWidth=2
    for(let j=-1;j<=1;j++){
      ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+j*s*0.5,py-s*0.8,px+j*s,py-s);ctx.stroke()
    }
  }
  ctx.restore()
}

function drawRunes(ctx, cx, cy, radius, theme, count=8) {
  ctx.save()
  ctx.strokeStyle='rgba(220,230,240,0.20)'
  ctx.lineWidth=2
  for(let i=0;i<count;i++){
    const a=(Math.PI*2*i)/count
    const x=cx+Math.cos(a)*radius, y=cy+Math.sin(a)*radius
    ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.stroke()
    line(ctx,x-5,y,x+5,y,theme.accent,1)
    line(ctx,x,y-5,x,y+5,theme.accent2,1)
  }
  ctx.restore()
}

function drawCrystalCluster(ctx, x, y, scale, colors) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  for(const [dx,dy,s,c] of [[0,0,28,colors[0]],[-25,12,20,colors[1]],[24,15,22,colors[2]],[4,-24,18,colors[0]]]){
    ctx.fillStyle=c
    ctx.beginPath();ctx.moveTo(dx,dy-s);ctx.lineTo(dx+s*.55,dy-s*.15);ctx.lineTo(dx+s*.28,dy+s);ctx.lineTo(dx-s*.32,dy+s*.55);ctx.lineTo(dx-s*.48,dy-s*.2);ctx.closePath();ctx.fill()
    ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=2;ctx.stroke()
  }
  ctx.restore()
}

function drawPotion(ctx,x,y,scale,color) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,30,25,7,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-19,-18,38,48,12,color)
  roundRect(ctx,-10,-32,20,16,5,'#cbd2dc')
  roundRect(ctx,-7,-35,14,7,3,'#6e7682')
  ctx.fillStyle='rgba(255,255,255,0.26)';ctx.fillRect(-12,-7,6,26)
  ctx.restore()
}

function drawTreasureChest(ctx,x,y,scale,theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.beginPath();ctx.ellipse(0,36,64,12,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-58,-8,116,48,12,'#735337')
  ctx.fillStyle='#9a7348';ctx.beginPath();ctx.arc(0,-8,58,Math.PI,Math.PI*2);ctx.fill()
  ctx.fillStyle=theme.gold;roundRect(ctx,-6,-3,12,38,5,ctx.fillStyle)
  roundRect(ctx,-48,10,96,6,3,'rgba(255,255,255,0.18)')
  ctx.restore()
}

function drawAdventureScene(ctx, x, y, w, h, theme, type = 'adventure', location = '') {
  const sky = ctx.createLinearGradient(x, y, x, y + h)
  sky.addColorStop(0, '#2a2930')
  sky.addColorStop(0.48, '#1b1d23')
  sky.addColorStop(1, '#0c0e12')
  ctx.fillStyle = sky
  ctx.fillRect(x, y, w, h)
  drawStars(ctx, x, y, w, h, theme, 34)
  drawClouds(ctx, x, y, w, h)
  glow(ctx, x + w * 0.74, y + h * 0.2, 150, theme.glow)
  ctx.fillStyle = 'rgba(240,238,255,0.55)'
  ctx.beginPath()
  ctx.arc(x + w * 0.74, y + h * 0.2, 32, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(12,14,18,0.72)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.7)
  ctx.lineTo(x + w * 0.2, y + h * 0.42)
  ctx.lineTo(x + w * 0.39, y + h * 0.65)
  ctx.lineTo(x + w * 0.58, y + h * 0.37)
  ctx.lineTo(x + w, y + h * 0.61)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fill()
  drawTree(ctx, x + 68, y + h * 0.53, 0.72, theme)
  drawTree(ctx, x + 150, y + h * 0.60, 0.48, theme)
  drawTree(ctx, x + w - 72, y + h * 0.52, 0.8, theme)
  drawTree(ctx, x + w - 160, y + h * 0.61, 0.52, theme)
  drawGroundPlants(ctx, x, y, w, h, theme, 16)
  ctx.fillStyle = 'rgba(10,13,16,0.78)'
  ctx.fillRect(x, y + h * 0.75, w, h * 0.25)
  drawCharacter(ctx, x + w * 0.49, y + h * 0.67, 1.0, theme, type === 'hunt' ? 'hunter' : 'battle')
  if (type === 'hunt') {
    ctx.fillStyle = 'rgba(160,223,125,0.26)'
    ctx.beginPath()
    ctx.ellipse(x + w * 0.73, y + h * 0.7, 38, 22, 0, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, 'WILD GROVE', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else {
    text(ctx, clampText(location || 'MYSTIC FOREST', 22).toUpperCase(), x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  }
  badge(ctx, x + 24, y + h - 50, type === 'hunt' ? 'HUNTING GROUNDS' : 'ADVENTURE', theme)
}

function drawFishingScene(ctx, x, y, w, h, theme) {
  drawWater(ctx, x, y, w, h, theme)
  ctx.fillStyle = 'rgba(10,14,17,0.78)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.5)
  ctx.quadraticCurveTo(x + w * 0.25, y + h * 0.39, x + w * 0.48, y + h * 0.5)
  ctx.quadraticCurveTo(x + w * 0.74, y + h * 0.61, x + w, y + h * 0.48)
  ctx.lineTo(x + w, y + h * 0.54)
  ctx.quadraticCurveTo(x + w * 0.72, y + h * 0.67, x + w * 0.48, y + h * 0.57)
  ctx.quadraticCurveTo(x + w * 0.22, y + h * 0.46, x, y + h * 0.56)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#3d2e2a'
  roundRect(ctx, x + 28, y + h * 0.44, w * 0.38, 20, 10, ctx.fillStyle)
  ctx.fillStyle = '#5b4234'
  roundRect(ctx, x + 42, y + h * 0.34, 20, 100, 8, ctx.fillStyle)
  drawCharacter(ctx, x + w * 0.25, y + h * 0.62, 0.82, theme, 'fishing')
  for (let i=0;i<7;i++) {
    const bx=x+w*(0.54+(i%3)*0.12), by=y+h*(0.64+(i%4)*0.07)
    ctx.strokeStyle='rgba(215,246,255,0.32)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,8+(i%3)*3,0,Math.PI*2);ctx.stroke()
  }
  drawFish(ctx, x + w * 0.69, y + h * 0.68, 0.8, theme)
  drawFish(ctx, x + w * 0.55, y + h * 0.78, 0.45, theme)
  for (let i=0;i<8;i++) {
    ctx.fillStyle='rgba(220,248,255,0.34)';ctx.beginPath();ctx.arc(x+w*(0.07+i*0.12),y+h*(0.60+(i%2)*0.08),2+(i%3),0,Math.PI*2);ctx.fill()
  }
  glow(ctx, x + w * 0.82, y + h * 0.17, 120, 'rgba(120,228,255,0.17)')
  ctx.fillStyle = 'rgba(230,250,255,0.52)'
  ctx.beginPath()
  ctx.arc(x + w * 0.82, y + h * 0.17, 28, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'RIVER OF AURORA', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'FISHING', theme, theme.accent2)
}

function drawMiningScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#2b2e36')
  g.addColorStop(0.55, '#1a1d23')
  g.addColorStop(1, '#0b0d11')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = 'rgba(8,10,13,0.74)'
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + h * 0.28)
  ctx.lineTo(x + w * 0.19, y + h * 0.1)
  ctx.lineTo(x + w * 0.36, y + h * 0.28)
  ctx.lineTo(x + w * 0.58, y + h * 0.12)
  ctx.lineTo(x + w, y + h * 0.3)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()
  for (const [cx, cy, c, s] of [[0.2, 0.72, theme.accent2, 36], [0.38, 0.61, theme.gold, 28], [0.68, 0.72, theme.success, 33], [0.82, 0.56, theme.accent, 25]]) {
    glow(ctx, x + w * cx, y + h * cy, 62, `${c}55`)
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.moveTo(x + w * cx, y + h * cy - s)
    ctx.lineTo(x + w * cx + s * 0.55, y + h * cy)
    ctx.lineTo(x + w * cx, y + h * cy + s)
    ctx.lineTo(x + w * cx - s * 0.55, y + h * cy)
    ctx.closePath()
    ctx.fill()
  }
  drawCrystalCluster(ctx, x+w*0.22, y+h*0.68, 0.85, [theme.accent2,theme.accent,theme.gold])
  drawCrystalCluster(ctx, x+w*0.78, y+h*0.63, 0.65, [theme.success,theme.accent2,theme.accent])
  drawCharacter(ctx, x + w * 0.48, y + h * 0.67, 0.9, theme, 'miner')
  ctx.fillStyle = 'rgba(255,239,173,0.72)'
  ctx.beginPath()
  ctx.arc(x + w * 0.48, y + h * 0.49, 12, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'CRYSTAL CAVERN', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'MINING', theme, theme.accent2)
}

function drawBossScene(ctx, x, y, w, h, theme) {
  const g = ctx.createRadialGradient(x + w * 0.7, y + h * 0.4, 20, x + w * 0.7, y + h * 0.4, w * 0.72)
  g.addColorStop(0, '#3a2932')
  g.addColorStop(0.42, '#21191f')
  g.addColorStop(1, '#0b090c')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.72, y + h * 0.42, 190, theme.glow)
  drawRunes(ctx, x+w*0.72, y+h*0.56, 145, theme, 10)
  ctx.fillStyle = 'rgba(7,6,9,0.76)'
  ctx.beginPath()
  ctx.ellipse(x + w * 0.72, y + h * 0.56, 112, 132, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = theme.accent
  ctx.beginPath()
  ctx.arc(x + w * 0.67, y + h * 0.46, 10, 0, Math.PI * 2)
  ctx.arc(x + w * 0.79, y + h * 0.46, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=5
  ctx.beginPath();ctx.moveTo(x+w*.62,y+h*.36);ctx.lineTo(x+w*.57,y+h*.24);ctx.lineTo(x+w*.68,y+h*.31);ctx.moveTo(x+w*.82,y+h*.31);ctx.lineTo(x+w*.93,y+h*.24);ctx.lineTo(x+w*.88,y+h*.36);ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(x + w * 0.72, y + h * 0.49, 108, 0.08, Math.PI - 0.08)
  ctx.stroke()
  drawCharacter(ctx, x + w * 0.27, y + h * 0.68, 0.82, theme, 'battle')
  spark(ctx, x + 90, y + 105, 10, theme.gold)
  spark(ctx, x + w - 80, y + 160, 7, theme.accent2)
  text(ctx, 'ANCIENT RAID', x + w * 0.7, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'BOSS RAID', theme, theme.danger)
}

function drawShopScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#332a3a')
  g.addColorStop(0.55, '#211d27')
  g.addColorStop(1, '#0c0b10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.35, 170, theme.glow)
  ctx.fillStyle = '#4b332a'
  roundRect(ctx, x + 40, y + 100, w - 80, 18, 9, ctx.fillStyle)
  roundRect(ctx, x + 55, y + 120, 18, 220, 9, ctx.fillStyle)
  roundRect(ctx, x + w - 73, y + 120, 18, 220, 9, ctx.fillStyle)
  const colors = [theme.accent, theme.accent2, theme.gold]
  drawPotion(ctx, x+w*0.20, y+h*0.40, 0.75, theme.accent)
  drawPotion(ctx, x+w*0.50, y+h*0.32, 0.62, theme.accent2)
  drawPotion(ctx, x+w*0.80, y+h*0.42, 0.70, theme.gold)
  for (let i = 0; i < 3; i++) {
    const bx = x + 60 + i * 112
    raised(ctx, bx, y + 170 + (i % 2) * 15, 88, 132, 22, theme, 7)
    inset(ctx, bx + 14, y + 184 + (i % 2) * 15, 60, 58, 16, theme, 5)
    ctx.fillStyle = colors[i]
    ctx.beginPath()
    ctx.arc(bx + 44, y + 213 + (i % 2) * 15, 16, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, ['POTION', 'GEM', 'RELIC'][i], bx + 44, y + 254 + (i % 2) * 15, 9, theme.soft, 'bold', 'center')
  }
  text(ctx, 'MOONLIT BAZAAR', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'SHOP', theme, theme.accent)
}

function drawProfileScene(ctx, x, y, w, h, theme, avatar) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#2b2c34')
  g.addColorStop(0.46, theme.surface)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  grid(ctx, x, y, w, h, theme, 30)
  softOrb(ctx, x + w * 0.16, y + h * 0.18, 185, theme.accent, 0.14)
  softOrb(ctx, x + w * 0.84, y + h * 0.74, 205, theme.accent2, 0.12)
  const cx = x + w * 0.5
  const cy = y + h * 0.39
  for (const r of [142, 128, 116]) {
    ctx.strokeStyle = r === 142 ? 'rgba(255,255,255,0.08)' : r === 128 ? theme.accent2 : theme.accent
    ctx.lineWidth = r === 142 ? 2 : 3
    ctx.beginPath()
    ctx.arc(cx, cy, r, -0.25, Math.PI * 1.55)
    ctx.stroke()
  }
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 + 0.18
    const px = cx + Math.cos(a) * 143
    const py = cy + Math.sin(a) * 143
    spark(ctx, px, py, i % 2 ? 5 : 8, i % 2 ? theme.accent2 : theme.gold, 0.72)
  }
  raised(ctx, cx - 128, cy - 128, 256, 256, 128, theme, 15)
  inset(ctx, cx - 111, cy - 111, 222, 222, 111, theme, 10)
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, 94, 0, Math.PI * 2)
  ctx.clip()
  if (avatar) {
    const ratio = Math.max(188 / avatar.width, 188 / avatar.height)
    const aw = avatar.width * ratio
    const ah = avatar.height * ratio
    ctx.drawImage(avatar, cx - aw / 2, cy - ah / 2, aw, ah)
  } else {
    const av = ctx.createRadialGradient(cx - 28, cy - 35, 8, cx, cy, 118)
    av.addColorStop(0, '#eef7ff')
    av.addColorStop(0.22, theme.accent2)
    av.addColorStop(1, theme.accent)
    ctx.fillStyle = av
    ctx.fillRect(cx - 94, cy - 94, 188, 188)
    text(ctx, 'Q', cx, cy + 34, 90, '#ffffff', 'bold', 'center')
  }
  ctx.restore()
  ctx.strokeStyle = theme.accent
  ctx.lineWidth = 6
  ctx.beginPath(); ctx.arc(cx, cy, 105, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, 112, 0, Math.PI * 2); ctx.stroke()
  raised(ctx, x + 24, y + 102, 150, 46, 23, theme, 6)
  text(ctx, 'PLAYER', x + 99, y + 130, 11, theme.soft, 'bold', 'center')
  raised(ctx, x + w - 174, y + 102, 150, 46, 23, theme, 6)
  text(ctx, 'RPG PROFILE', x + w - 99, y + 130, 11, theme.soft, 'bold', 'center')
  const infoY = y + h - 158
  inset(ctx, x + 26, infoY, w - 52, 82, 24, theme, 7)
  const labels = [['HP', theme.success], ['MANA', theme.accent2], ['STAMINA', theme.gold], ['CORE', theme.accent]]
  labels.forEach(([label, color], i) => {
    const bx = x + 42 + i * 96
    raised(ctx, bx, infoY + 14, 76, 54, 18, theme, 5)
    miniIcon(ctx, bx + 15, infoY + 18, label === 'HP' ? 'hp' : label === 'MANA' ? 'mana' : label === 'STAMINA' ? 'stamina' : 'core', theme, color)
  })
  text(ctx, 'PLAYER PROFILE', cx, y + 44, 12, theme.muted, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'PROFILE', theme, theme.accent)
}


function drawInventoryScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#292e37')
  g.addColorStop(0.5, '#1a1e25')
  g.addColorStop(1, '#0a0d11')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.52, y + h * 0.34, 180, theme.glow)
  raised(ctx, x + 55, y + 115, w - 110, 310, 32, theme, 12)
  inset(ctx, x + 82, y + 145, w - 164, 255, 24, theme, 8)
  const slots = 9
  for (let i = 0; i < slots; i++) {
    const col = i % 3
    const row = Math.floor(i / 3)
    const sx = x + 112 + col * 100
    const sy = y + 172 + row * 68
    inset(ctx, sx, sy, 72, 50, 16, theme, 5)
    if (i < 5) {
      ctx.fillStyle = [theme.accent, theme.accent2, theme.gold, theme.success, theme.danger][i]
      ctx.beginPath()
      ctx.arc(sx + 36, sy + 25, 11 + (i % 2) * 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  drawCharacter(ctx, x + w * 0.5, y + h * 0.82, 0.54, theme, 'idle')
  text(ctx, 'ADVENTURER BAG', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'INVENTORY', theme, theme.accent2)
}

function drawLeaderboardScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#35312a')
  g.addColorStop(0.45, '#202126')
  g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.32, 180, theme.glow)
  const podiumY = y + h * 0.55
  const blocks = [
    { x: x + w * 0.24, h: 110, c: '#c6ced8', n: '02' },
    { x: x + w * 0.5, h: 145, c: theme.gold, n: '01' },
    { x: x + w * 0.76, h: 90, c: '#c99773', n: '03' },
  ]
  for (const b of blocks) {
    raised(ctx, b.x - 42, podiumY - b.h, 84, b.h, 18, theme, 9)
    inset(ctx, b.x - 25, podiumY - b.h + 18, 50, 50, 25, theme, 5)
    ctx.fillStyle = b.c
    ctx.beginPath()
    ctx.arc(b.x, podiumY - b.h + 43, 13, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, b.n, b.x, podiumY + 28, 12, b.c, 'bold', 'center')
  }
  drawCharacter(ctx, x + w * 0.5, y + h * 0.49, 0.62, theme, 'idle')
  text(ctx, 'HALL OF HEROES', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'LEADERBOARD', theme, theme.gold)
}

function drawRewardScene(ctx, x, y, w, h, theme) {
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.4, 20, x + w * 0.5, y + h * 0.4, w * 0.7)
  g.addColorStop(0, '#332b3d')
  g.addColorStop(0.5, '#201c29')
  g.addColorStop(1, '#0b0a0e')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.42, 190, theme.glow)
  raised(ctx, x + w * 0.22, y + h * 0.28, w * 0.56, h * 0.38, 36, theme, 14)
  inset(ctx, x + w * 0.29, y + h * 0.36, w * 0.42, h * 0.22, 26, theme, 8)
  for (let i = 0; i < 9; i++) {
    const a = (Math.PI * 2 * i) / 9
    const rx = x + w * 0.5 + Math.cos(a) * 145
    const ry = y + h * 0.47 + Math.sin(a) * 105
    spark(ctx, rx, ry, 5 + (i % 3) * 2, i % 2 ? theme.accent2 : theme.gold, 0.72)
  }
  drawTreasureChest(ctx, x+w*.5, y+h*.62, 0.78, theme)
  drawCharacter(ctx, x + w * 0.5, y + h * 0.82, 0.48, theme, 'idle')
  text(ctx, 'REWARD UNLOCKED', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'REWARD', theme, theme.gold)
}

function drawLevelupScene(ctx, x, y, w, h, theme) {
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, 10, x + w * 0.5, y + h * 0.45, w * 0.72)
  g.addColorStop(0, '#3a3048')
  g.addColorStop(0.48, '#211d2d')
  g.addColorStop(1, '#0b090e')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.42, 210, theme.glow)
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12
    const rx = x + w * 0.5 + Math.cos(a) * 155
    const ry = y + h * 0.43 + Math.sin(a) * 125
    spark(ctx, rx, ry, 7, i % 2 ? theme.accent2 : theme.gold, 0.8)
  }
  raised(ctx, x + w * 0.28, y + h * 0.28, w * 0.44, h * 0.3, 32, theme, 14)
  inset(ctx, x + w * 0.33, y + h * 0.34, w * 0.34, h * 0.18, 24, theme, 8)
  text(ctx, 'LEVEL', x + w * 0.5, y + h * 0.43, 13, theme.soft, 'bold', 'center')
  text(ctx, 'UP', x + w * 0.5, y + h * 0.52, 42, theme.accent, 'bold', 'center')
  drawCharacter(ctx, x + w * 0.5, y + h * 0.82, 0.58, theme, 'battle')
  text(ctx, 'ASCENSION', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'LEVEL UP', theme, theme.accent)
}

function drawExpeditionScene(ctx, x, y, w, h, theme) {
  drawAdventureScene(ctx, x, y, w, h, theme, 'adventure')
  ctx.fillStyle = 'rgba(18,20,28,0.86)'
  roundRect(ctx, x + w * 0.12, y + h * 0.22, w * 0.28, 70, 20, ctx.fillStyle)
  text(ctx, 'EXPEDITION', x + w * 0.26, y + h * 0.22 + 30, 12, theme.soft, 'bold', 'center')
  text(ctx, 'RETURNING', x + w * 0.26, y + h * 0.22 + 52, 10, theme.accent2, 'bold', 'center')
}

function drawGenericScene(ctx, x, y, w, h, theme, type) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#29272e')
  g.addColorStop(0.55, '#1d1e24')
  g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  grid(ctx, x, y, w, h, theme, 30)
  glow(ctx, x + w * 0.5, y + h * 0.4, 190, theme.glow)
  drawCharacter(ctx, x + w * 0.5, y + h * 0.65, 0.92, theme, type === 'battle' ? 'battle' : 'idle')
  badge(ctx, x + 24, y + h - 50, type.toUpperCase(), theme)
}

function drawTrainingScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, theme.raised)
  g.addColorStop(0.5, theme.surface)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * 0.72, y + h * 0.25, 150, theme.accent, 0.13)
  softOrb(ctx, x + w * 0.28, y + h * 0.72, 130, theme.accent2, 0.10)
  raised(ctx, x + 58, y + 116, w - 116, 250, 34, theme, 12)
  inset(ctx, x + 86, y + 144, w - 172, 194, 26, theme, 8)
  drawCharacter(ctx, x + w * 0.5, y + h * 0.67, 0.86, theme, 'battle')
  for (const [i, label] of ['ATK','DEF','SPD','LUCK'].entries()) {
    neumorphicChip(ctx, x + 58 + i * 94, y + 392, 82, 38, label, '+', theme, [theme.accent, theme.accent2, theme.success, theme.gold][i])
  }
  text(ctx, 'TRAINING GROUNDS', x + w * 0.5, y + 44, 12, theme.muted, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'TRAINING', theme, theme.accent)
}

function drawBankScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, theme.raised)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * 0.5, y + h * 0.32, 180, theme.gold, 0.12)
  raised(ctx, x + 68, y + 128, w - 136, 230, 36, theme, 13)
  inset(ctx, x + 102, y + 164, w - 204, 150, 28, theme, 8)
  ctx.fillStyle = theme.gold
  ctx.beginPath()
  ctx.arc(x + w * 0.5, y + 238, 42, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'Q', x + w * 0.5, y + 253, 34, '#ffffff', 'bold', 'center')
  neumorphicChip(ctx, x + 76, y + 400, 150, 42, 'CASH', 'WALLET', theme, theme.success)
  neumorphicChip(ctx, x + w - 226, y + 400, 150, 42, 'BANK', 'VAULT', theme, theme.gold)
  text(ctx, 'RPG BANK', x + w * 0.5, y + 44, 12, theme.muted, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'BANK', theme, theme.gold)
}

function drawQuestScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, theme.raised)
  g.addColorStop(0.5, theme.surface)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * 0.5, y + h * 0.28, 190, theme.accent, 0.12)
  raised(ctx, x + 80, y + 120, w - 160, 290, 32, theme, 13)
  inset(ctx, x + 108, y + 148, w - 216, 234, 24, theme, 8)
  ctx.fillStyle = theme.gold
  ctx.beginPath()
  ctx.moveTo(x + w * 0.5, y + 172)
  ctx.lineTo(x + w * 0.5 + 56, y + 208)
  ctx.lineTo(x + w * 0.5 + 38, y + 292)
  ctx.lineTo(x + w * 0.5, y + 320)
  ctx.lineTo(x + w * 0.5 - 38, y + 292)
  ctx.lineTo(x + w * 0.5 - 56, y + 208)
  ctx.closePath()
  ctx.fill()
  text(ctx, '!', x + w * 0.5, y + 275, 58, '#ffffff', 'bold', 'center')
  text(ctx, 'QUEST BOARD', x + w * 0.5, y + 44, 12, theme.muted, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'QUEST', theme, theme.accent)
}


function drawAlchemyScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#34313b'); g.addColorStop(0.55, '#211f27'); g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * .52, y + h * .32, 180, theme.accent, .16)
  raised(ctx, x + 70, y + 115, w - 140, 260, 34, theme, 12)
  inset(ctx, x + 96, y + 145, w - 192, 205, 28, theme, 8)
  drawPotion(ctx, x + w*.25, y+h*.48, .95, theme.accent)
  drawPotion(ctx, x + w*.50, y+h*.40, 1.15, theme.accent2)
  drawPotion(ctx, x + w*.75, y+h*.50, .82, theme.gold)
  for (let i=0;i<8;i++) spark(ctx, x+w*(.16+i*.1), y+h*(.68+(i%2)*.06), 4+(i%3)*2, i%2?theme.accent2:theme.accent, .65)
  text(ctx, 'ARCANE LABORATORY', x+w*.5, y+44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x+24, y+h-50, 'ALCHEMY', theme, theme.accent)
}

function drawForgeScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,'#383236');g.addColorStop(.55,'#211e21');g.addColorStop(1,'#0b0b0d');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  glow(ctx,x+w*.5,y+h*.55,180,'rgba(255,151,91,.18)')
  raised(ctx,x+62,y+115,w-124,270,34,theme,12); inset(ctx,x+88,y+143,w-176,215,28,theme,8)
  ctx.fillStyle='#4a3a31'; roundRect(ctx,x+120,y+270,w-240,42,16,ctx.fillStyle)
  drawCharacter(ctx,x+w*.5,y+h*.69,.86,theme,'miner')
  ctx.strokeStyle='#e7d5bc';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+w*.64,y+h*.46);ctx.lineTo(x+w*.80,y+h*.27);ctx.stroke()
  glow(ctx,x+w*.8,y+h*.27,60,'rgba(255,184,117,.24)'); spark(ctx,x+w*.8,y+h*.27,13,theme.gold,.9)
  text(ctx,'ROYAL FORGE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'BLACKSMITH',theme,theme.gold)
}

function drawCookingScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#34302a');g.addColorStop(.5,'#211e1b');g.addColorStop(1,'#0c0c0d');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  softOrb(ctx,x+w*.5,y+h*.32,180,theme.gold,.14); raised(ctx,x+64,y+120,w-128,260,34,theme,12); inset(ctx,x+90,y+148,w-180,205,28,theme,8)
  ctx.fillStyle='#6f5137';roundRect(ctx,x+112,y+270,w-224,30,15,ctx.fillStyle)
  drawPotion(ctx,x+w*.25,y+h*.48,.8,theme.success);drawPotion(ctx,x+w*.75,y+h*.48,.8,theme.accent)
  drawCharacter(ctx,x+w*.5,y+h*.70,.82,theme,'idle')
  for(let i=0;i<7;i++){ctx.fillStyle='rgba(245,245,245,.22)';ctx.beginPath();ctx.arc(x+w*.48+i*7,y+h*(.30-(i%3)*.025),3,0,Math.PI*2);ctx.fill()}
  text(ctx,'HEARTH & TABLE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'COOKING',theme,theme.gold)
}

function drawGardenScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#30352f');g.addColorStop(.5,'#1d241e');g.addColorStop(1,'#0a0d0b');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawClouds(ctx,x,y,w,h); drawStars(ctx,x,y,w,h,theme,16)
  ctx.fillStyle='#4d3d2c';roundRect(ctx,x+50,y+h*.55,w-100,h*.26,28,ctx.fillStyle)
  for(let i=0;i<12;i++){const px=x+90+(i%6)*72,py=y+h*.62+Math.floor(i/6)*65;ctx.fillStyle=i%3?theme.success:theme.accent2;ctx.beginPath();ctx.arc(px,py,12+(i%3)*4,0,Math.PI*2);ctx.fill();ctx.strokeStyle=theme.soft;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py+8);ctx.lineTo(px-8,py+28);ctx.moveTo(px,py+8);ctx.lineTo(px+10,py+24);ctx.stroke()}
  drawCharacter(ctx,x+w*.76,y+h*.73,.64,theme,'idle');text(ctx,'MOONLIT GARDEN',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'GARDEN',theme,theme.success)
}

function drawPetScene(ctx, x, y, w, h, theme) {
  const g=ctx.createRadialGradient(x+w*.5,y+h*.4,20,x+w*.5,y+h*.4,w*.7);g.addColorStop(0,'#343440');g.addColorStop(.55,'#211f29');g.addColorStop(1,'#0b0b0f');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  softOrb(ctx,x+w*.5,y+h*.4,180,theme.accent2,.14);drawStars(ctx,x,y,w,h,theme,24)
  raised(ctx,x+72,y+118,w-144,290,36,theme,12);inset(ctx,x+96,y+146,w-192,236,28,theme,8)
  const px=x+w*.5,py=y+h*.53;ctx.fillStyle=theme.accent;ctx.beginPath();ctx.arc(px,py,72,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4d8c2';ctx.beginPath();ctx.arc(px,py-12,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#25232c';ctx.beginPath();ctx.arc(px-16,py-18,5,0,Math.PI*2);ctx.arc(px+16,py-18,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=theme.accent2;ctx.beginPath();ctx.moveTo(px-34,py-45);ctx.lineTo(px-52,py-76);ctx.lineTo(px-10,py-58);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(px+34,py-45);ctx.lineTo(px+52,py-76);ctx.lineTo(px+10,py-58);ctx.closePath();ctx.fill();
  text(ctx,'COMPANION SANCTUARY',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'PET',theme,theme.accent2)
}

function drawGuildScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#34312c');g.addColorStop(.5,'#201f1d');g.addColorStop(1,'#0b0c0e');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  glow(ctx,x+w*.5,y+h*.34,190,'rgba(228,196,125,.16)');raised(ctx,x+72,y+115,w-144,300,38,theme,12);inset(ctx,x+96,y+145,w-192,238,30,theme,8)
  ctx.fillStyle=theme.gold;ctx.beginPath();ctx.moveTo(x+w*.5,y+h*.27);ctx.lineTo(x+w*.65,y+h*.46);ctx.lineTo(x+w*.58,y+h*.66);ctx.lineTo(x+w*.42,y+h*.66);ctx.lineTo(x+w*.35,y+h*.46);ctx.closePath();ctx.fill();
  text(ctx,'GUILD HALL',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'GUILD',theme,theme.gold)
}

function drawTreasureScene(ctx, x, y, w, h, theme) {
  const g=ctx.createRadialGradient(x+w*.5,y+h*.42,20,x+w*.5,y+h*.42,w*.75);g.addColorStop(0,'#403628');g.addColorStop(.5,'#211d18');g.addColorStop(1,'#090a0c');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawStars(ctx,x,y,w,h,theme,30);glow(ctx,x+w*.5,y+h*.53,190,'rgba(242,207,121,.18)');drawTreasureChest(ctx,x+w*.5,y+h*.57,1.05,theme);drawCharacter(ctx,x+w*.5,y+h*.82,.48,theme,'idle');
  for(let i=0;i<10;i++)spark(ctx,x+w*(.18+i*.07),y+h*(.34+(i%4)*.05),4+(i%3)*2,theme.gold,.75)
  text(ctx,'ANCIENT TREASURE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'TREASURE',theme,theme.gold)
}

function drawWoodcutScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#30362f');g.addColorStop(.5,'#1d251f');g.addColorStop(1,'#0a0e0b');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawStars(ctx,x,y,w,h,theme,18);drawTree(ctx,x+w*.2,y+h*.52,.95,theme);drawTree(ctx,x+w*.78,y+h*.5,.9,theme);drawCharacter(ctx,x+w*.5,y+h*.72,.84,theme,'miner');
  for(let i=0;i<8;i++)spark(ctx,x+w*(.38+i*.045),y+h*(.48+i*.025),4,theme.gold,.55)
  text(ctx,'ANCIENT GROVE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'WOODCUT',theme,theme.success)
}

function drawScene(ctx, type, x, y, w, h, theme, avatar, data = {}) {
  sceneFrame(ctx, x, y, w, h, theme)
  const ix = x + 12
  const iy = y + 12
  const iw = w - 24
  const ih = h - 24
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(ix, iy, iw, ih, 29)
  ctx.clip()
  if (type === 'adventure' || type === 'hunt') drawAdventureScene(ctx, ix, iy, iw, ih, theme, type, data.location || '')
  else if (type === 'fishing') drawFishingScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'mining') drawMiningScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'boss' || type === 'battle') drawBossScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'shop') drawShopScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'profile') drawProfileScene(ctx, ix, iy, iw, ih, theme, avatar)
  else if (type === 'inventory') drawInventoryScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'leaderboard') drawLeaderboardScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'reward') drawRewardScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'levelup') drawLevelupScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'expedition') drawExpeditionScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'work') drawAdventureScene(ctx, ix, iy, iw, ih, theme, 'adventure', data.location || 'CAREER DISTRICT')
  else if (type === 'daily' || type === 'hourly' || type === 'reward') drawRewardScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'berburu') drawAdventureScene(ctx, ix, iy, iw, ih, theme, 'hunt', data.location || 'WILD GROVE')
  else if (type === 'training') drawTrainingScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'bank') drawBankScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'quest') drawQuestScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'alchemy') drawAlchemyScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'blacksmith' || type === 'craft') drawForgeScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'cook' || type === 'cooking') drawCookingScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'garden') drawGardenScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'pet' || type === 'petshop' || type === 'breeding') drawPetScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'guild') drawGuildScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'treasure') drawTreasureScene(ctx, ix, iy, iw, ih, theme)
  else if (type === 'woodcut') drawWoodcutScene(ctx, ix, iy, iw, ih, theme)
  else drawGenericScene(ctx, ix, iy, iw, ih, theme, type)
  ctx.restore()
}

function softOrb(ctx, x, y, radius, color, alpha = 0.14) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  const hex = String(color).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) || 0
  const gg = parseInt(hex.slice(2, 4), 16) || 0
  const b = parseInt(hex.slice(4, 6), 16) || 0
  g.addColorStop(0, `rgba(${r},${gg},${b},${alpha})`)
  g.addColorStop(0.55, `rgba(${r},${gg},${b},${alpha * 0.35})`)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function neumorphicChip(ctx, x, y, w, h, label, value, theme, accent = theme.accent) {
  raised(ctx, x, y, w, h, h / 2, theme, 6)
  inset(ctx, x + 8, y + 8, w - 16, h - 16, (h - 16) / 2, theme, 3)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x + 24, y + h / 2, 5, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, String(label).toUpperCase(), x + 38, y + 22, 9, theme.muted, 'bold')
  text(ctx, value, x + w - 18, y + 23, 12, theme.ink, 'bold', 'right')
}

function miniIcon(ctx, x, y, type, theme, accent = theme.accent) {
  inset(ctx, x, y, 46, 46, 15, theme, 4)
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.lineWidth = 3
  if (type === 'hp') { ctx.beginPath(); ctx.moveTo(x+23,y+34); ctx.bezierCurveTo(x+2,y+22,x+8,y+9,x+19,y+15); ctx.bezierCurveTo(x+23,y+7,x+38,y+12,x+23,y+34); ctx.fill() }
  else if (type === 'mana') { ctx.beginPath(); ctx.moveTo(x+23,y+8); ctx.lineTo(x+34,y+23); ctx.lineTo(x+23,y+38); ctx.lineTo(x+12,y+23); ctx.closePath(); ctx.stroke() }
  else if (type === 'stamina') { ctx.beginPath(); ctx.moveTo(x+26,y+7); ctx.lineTo(x+16,y+23); ctx.lineTo(x+24,y+23); ctx.lineTo(x+20,y+39); ctx.lineTo(x+32,y+20); ctx.lineTo(x+24,y+20); ctx.closePath(); ctx.fill() }
  else { ctx.beginPath(); ctx.arc(x+23,y+23,12,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x+23,y+23,4,0,Math.PI*2); ctx.fill() }
}

function progress(ctx, x, y, w, h, value, color, theme) {
  const p = Math.max(0, Math.min(1, Number(value) || 0))
  inset(ctx, x, y, w, h, h / 2, theme, 5)
  if (!p) return
  const g = ctx.createLinearGradient(x, y, x + w, y)
  g.addColorStop(0, color)
  g.addColorStop(1, theme.accent2)
  roundRect(ctx, x + 4, y + 4, Math.max(h - 8, (w - 8) * p), h - 8, (h - 8) / 2, g)
  ctx.save()
  ctx.globalAlpha = 0.28
  roundRect(ctx, x + 7, y + 6, Math.max(8, (w - 14) * p), 3, 2, '#ffffff')
  ctx.restore()
}

function statTile(ctx, x, y, w, h, label, value, color, theme) {
  raised(ctx, x, y, w, h, 22, theme, 8)
  inset(ctx, x + 10, y + 10, w - 20, h - 20, 16, theme, 4)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + 26, y + 26, 4, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, String(label).toUpperCase(), x + 40, y + 30, 10, theme.soft, 'bold')
  text(ctx, clampText(value, 19), x + 18, y + 59, 19, color, 'bold')
}

function section(ctx, label, x, y, theme) {
  text(ctx, clampText(label, 20).toUpperCase(), x, y, 11, theme.soft, 'bold')
  line(ctx, x, y + 10, x + 110, y + 10, theme.accent, 2)
}

function topBrand(ctx, theme, title, subtitle) {
  text(ctx, 'HABI RPG', 58, 48, 13, theme.soft, 'bold')
  text(ctx, clampText(title, 25), 58, 88, 37, theme.ink, 'bold')
  if (subtitle) text(ctx, clampText(subtitle, 46), 60, 116, 14, theme.soft)
  raised(ctx, WIDTH - 210, 32, 150, 42, 21, theme, 7)
  text(ctx, 'NEUMORPHIC', WIDTH - 135, 58, 10, theme.soft, 'bold', 'center')
}

function footer(ctx, theme) {
  text(ctx, clampText(settings.botName || 'Habibih Cloud ID', 20), WIDTH - 58, HEIGHT - 26, 11, theme.soft, 'bold', 'right')
}

async function loadOptionalImage(source) {
  if (!source) return null
  try {
    if (Buffer.isBuffer(source)) return await loadImage(source)
    const response = await fetch(String(source), { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null
    return await loadImage(Buffer.from(await response.arrayBuffer()))
  } catch {
    return null
  }
}

async function renderRpgCard(type, data = {}) {
  const theme = themeFor(type)
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  bg.addColorStop(0, theme.bg)
  bg.addColorStop(0.5, theme.surface)
  bg.addColorStop(1, theme.bg)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  glow(ctx, WIDTH - 80, 60, 260, theme.glow)
  glow(ctx, 70, HEIGHT - 30, 230, theme.glow)
  topBrand(ctx, theme, data.title || type.toUpperCase(), data.subtitle || '')

  const artX = 54
  const artY = 148
  const artW = 470
  const artH = 642
  const panelX = 552
  const panelY = 148
  const panelW = 674
  const panelH = 642
  const avatar = type === 'profile' ? await loadOptionalImage(data.avatarUrl) : null

  drawScene(ctx, type, artX, artY, artW, artH, theme, avatar, data)
  raised(ctx, panelX, panelY, panelW, panelH, 38, theme, 14)
  inset(ctx, panelX + 14, panelY + 14, panelW - 28, panelH - 28, 30, theme, 7)

  if (type === 'profile') {
    const profileName = clampText(data.name || 'Player', 23)
    text(ctx, profileName, panelX + 38, panelY + 55, 26, theme.ink, 'bold')
    text(ctx, clampText(data.role || 'Warrior', 20), panelX + 38, panelY + 80, 12, theme.accent, 'bold')
    text(ctx, `LV ${number(data.level ?? 0)}`, panelX + panelW - 38, panelY + 55, 14, theme.soft, 'bold', 'right')
    text(ctx, `XP ${number(data.exp ?? 0)}`, panelX + panelW - 38, panelY + 79, 10, theme.muted, 'bold', 'right')
    neumorphicChip(ctx, panelX + 38, panelY + 96, 170, 38, 'RANK', clampText(data.role || 'HERO', 12), theme, theme.accent)
    neumorphicChip(ctx, panelX + 220, panelY + 96, 170, 38, 'LEVEL', number(data.level ?? 0), theme, theme.accent2)
    neumorphicChip(ctx, panelX + 402, panelY + 96, 208, 38, 'COIN', rupiah(data.koin ?? 0), theme, theme.gold)
    section(ctx, 'Core Status', panelX + 38, panelY + 154, theme)
    statTile(ctx, panelX + 38, panelY + 174, 276, 70, 'Coin', rupiah(data.koin ?? 0), theme.gold, theme)
    statTile(ctx, panelX + 334, panelY + 174, 276, 70, 'EXP', number(data.exp ?? 0), theme.accent2, theme)
    section(ctx, 'Resources', panelX + 38, panelY + 270, theme)
    const bars = [['HP', data.health, data.maxHealth, theme.success], ['MANA', data.mana, data.maxMana, theme.accent2], ['STAMINA', data.stamina, data.maxStamina, theme.gold]]
    let by = panelY + 292
    for (const [label, current, max, color] of bars) {
      const cur = Number(current ?? 0)
      const cap = Math.max(1, Number(max ?? 0))
      text(ctx, label, panelX + 38, by, 10, theme.soft, 'bold')
      text(ctx, `${number(cur)} / ${number(cap)}`, panelX + panelW - 38, by, 10, theme.soft, 'bold', 'right')
      progress(ctx, panelX + 38, by + 10, panelW - 76, 18, cur / cap, color, theme)
      by += 58
    }
    section(ctx, 'Attributes', panelX + 38, panelY + 468, theme)
    const attrs = [['ATK', data.attack, theme.accent], ['DEF', data.defense, theme.accent2], ['SPD', data.speed, theme.success], ['LUCK', data.luck, theme.gold]]
    attrs.forEach(([label, value, color], i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      statTile(ctx, panelX + 38 + col * 296, panelY + 488 + row * 68, 276, 58, label, number(value ?? 0), color, theme)
    })
    section(ctx, 'Profile Details', panelX + 38, panelY + 632, theme)
    text(ctx, `STATUS  ${data.status || 'ONLINE'}`, panelX + 38, panelY + 654, 10, theme.soft, 'bold')
    text(ctx, `XP PROGRESS  ${Math.round((Number(data.levelXpProgress ?? 0) || 0) * 100)}%`, panelX + panelW - 38, panelY + 654, 10, theme.muted, 'bold', 'right')
  } else if (type === 'inventory') {
    text(ctx, clampText(data.name || 'Player', 24), panelX + 38, panelY + 58, 27, theme.ink, 'bold')
    text(ctx, 'ITEM STORAGE', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    statTile(ctx, panelX + 38, panelY + 108, 280, 78, 'Coin', rupiah(data.koin || 0), theme.gold, theme)
    statTile(ctx, panelX + 330, panelY + 108, 280, 78, 'HP', `${number(data.health || 0)}/${number(data.maxHealth || 0)}`, theme.success, theme)
    section(ctx, 'Items', panelX + 38, panelY + 224, theme)
    const items = (data.items || []).slice(0, 7)
    let iy = panelY + 244
    for (const item of items) {
      raised(ctx, panelX + 38, iy, 572, 50, 18, theme, 7)
      inset(ctx, panelX + 49, iy + 10, 32, 30, 11, theme, 4)
      ctx.fillStyle = theme.accent
      ctx.beginPath()
      ctx.arc(panelX + 65, iy + 25, 7, 0, Math.PI * 2)
      ctx.fill()
      text(ctx, clampText(item.name, 32), panelX + 98, iy + 31, 14, theme.ink, 'bold')
      text(ctx, `×${number(item.count || 0)}`, panelX + 588, iy + 31, 14, theme.accent2, 'bold', 'right')
      iy += 55
    }
    if (!items.length) text(ctx, 'Inventory masih kosong', panelX + panelW / 2, panelY + 355, 16, theme.soft, 'bold', 'center')
  } else if (type === 'leaderboard') {
    text(ctx, clampText(data.category || 'RPG Ranking', 28), panelX + 38, panelY + 58, 27, theme.ink, 'bold')
    text(ctx, 'SEASON RANKING', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    const players = (data.players || []).slice(0, 7)
    let ly = panelY + 114
    for (const [index, player] of players.entries()) {
      const rank = index + 1
      const top = rank <= 3
      raised(ctx, panelX + 38, ly, 572, 56, 18, theme, top ? 9 : 6)
      const color = rank === 1 ? theme.gold : rank === 2 ? '#d4dbe4' : rank === 3 ? '#d3a77f' : theme.soft
      inset(ctx, panelX + 49, ly + 9, 38, 38, 15, theme, 4)
      text(ctx, String(rank).padStart(2, '0'), panelX + 68, ly + 34, 11, color, 'bold', 'center')
      text(ctx, clampText(player.name, 25), panelX + 105, ly + 34, 15, theme.ink, top ? 'bold' : 'normal')
      text(ctx, clampText(player.value, 18), panelX + 588, ly + 34, 14, top ? color : theme.accent2, 'bold', 'right')
      ly += 64
    }
  } else if (type === 'boss' || type === 'battle') {
    text(ctx, clampText(data.name || 'Boss', 25), panelX + 38, panelY + 58, 27, theme.ink, 'bold')
    text(ctx, clampText(data.status || '', 34), panelX + 38, panelY + 84, 14, data.victory ? theme.success : theme.danger, 'bold')
    statTile(ctx, panelX + 38, panelY + 108, 176, 76, 'Damage', number(data.damage || 0), theme.danger, theme)
    statTile(ctx, panelX + 230, panelY + 108, 176, 76, 'Round', number(data.round || 0), theme.accent2, theme)
    statTile(ctx, panelX + 422, panelY + 108, 188, 76, 'EXP', `+${number(data.exp || 0)}`, theme.accent, theme)
    section(ctx, 'Boss Health', panelX + 38, panelY + 226, theme)
    text(ctx, `${number(data.hp || 0)} / ${number(data.maxHp || 0)}`, panelX + panelW - 38, panelY + 226, 11, theme.soft, 'bold', 'right')
    progress(ctx, panelX + 38, panelY + 244, panelW - 76, 22, Number(data.hp || 0) / Math.max(1, Number(data.maxHp || 0)), theme.danger, theme)
    section(ctx, 'Rewards', panelX + 38, panelY + 320, theme)
    statTile(ctx, panelX + 38, panelY + 342, 276, 82, 'EXP', `+${number(data.exp || 0)}`, theme.accent2, theme)
    statTile(ctx, panelX + 334, panelY + 342, 276, 82, 'Coin', `+${rupiah(data.koin || 0)}`, theme.gold, theme)
    if (data.loot) {
      section(ctx, 'Loot', panelX + 38, panelY + 460, theme)
      raised(ctx, panelX + 38, panelY + 480, 572, 58, 18, theme, 6)
      text(ctx, clampText(data.loot, 48), panelX + 58, panelY + 516, 15, theme.soft, 'bold')
    }
  } else if (type === 'shop') {
    text(ctx, clampText(data.name || 'RPG Shop', 30), panelX + 38, panelY + 58, 27, theme.ink, 'bold')
    text(ctx, 'ITEM CATALOG', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    const items = (data.items || []).slice(0, 6)
    let sy = panelY + 112
    for (const item of items) {
      raised(ctx, panelX + 38, sy, 572, 62, 19, theme, 7)
      inset(ctx, panelX + 50, sy + 11, 40, 40, 14, theme, 5)
      ctx.fillStyle = theme.accent
      ctx.beginPath()
      ctx.arc(panelX + 70, sy + 31, 8, 0, Math.PI * 2)
      ctx.fill()
      text(ctx, clampText(item.name, 30), panelX + 106, sy + 28, 14, theme.ink, 'bold')
      text(ctx, rupiah(item.price || 0), panelX + 588, sy + 39, 14, theme.gold, 'bold', 'right')
      sy += 69
    }
  } else {
    const result = cleanText(data.result || data.title || '')
    text(ctx, clampText(result, 35), panelX + 38, panelY + 60, 28, data.victory === false ? theme.danger : theme.success, 'bold')
    text(ctx, clampText(data.location || data.subtitle || '', 45), panelX + 38, panelY + 88, 15, theme.soft)
    const stats = data.stats || []
    const tiles = stats.slice(0, 6)
    let sx = panelX + 38
    let sy = panelY + 126
    for (const stat of tiles) {
      statTile(ctx, sx, sy, 276, 84, stat.label, String(stat.value), stat.color || theme.accent, theme)
      sx += 296
      if (sx > panelX + 360) {
        sx = panelX + 38
        sy += 101
      }
    }
    if (data.location && tiles.length < 4) {
      section(ctx, 'Location', panelX + 38, panelY + 438, theme)
      text(ctx, clampText(data.location, 48), panelX + 38, panelY + 470, 18, theme.ink, 'bold')
    }
  }

  footer(ctx, theme)
  return canvas.toBuffer('image/png')
}

function communityButtons() {
  const buttons = []
  const channelUrl = cleanText(settings.links?.channelLink)
  const groupUrl = cleanText(settings.links?.groupLink)
  if (channelUrl) buttons.push({ type: 'url', label: 'SALURAN HABI', url: channelUrl })
  if (groupUrl) buttons.push({ type: 'url', label: 'GRUP HABI', url: groupUrl })
  return buttons
}

async function sendRpgCard(conn, m, options = {}) {
  const image = await renderRpgCard(options.type || 'reward', options.data || {})
  const customButtons = Array.isArray(options.buttons) ? options.buttons : []
  const buttons = [...customButtons, ...communityButtons()].slice(0, 3)
  const rawBody = cleanText(options.body || options.caption || '')
  const body = rawBody ? `${rawBody}\n` : ''
  const footerText = cleanText(options.footer || settings.footerText || settings.botName).slice(0, 60)
  const quickButtons = buttons.filter((button) => button.type !== 'url')
  const urlButtons = buttons.filter((button) => button.type === 'url')
  return sendInteractive(conn, m.chat, {
    title: cleanText(options.headerTitle || 'HABI RPG'),
    subtitle: cleanText(options.headerSubtitle || options.data?.subtitle || ''),
    body,
    footer: footerText,
    image,
    buttons: quickButtons,
    urlButtons,
    mentions: options.mentions || [],
  }, { quoted: m.raw })
}

export { renderRpgCard, sendRpgCard, clampText }

export default { renderRpgCard, sendRpgCard, clampText }
