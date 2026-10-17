# -*- coding: utf-8 -*-
"""自检 video_verify：对已知正常/残缺样本 + 合成边界样本做判定，并验证 sidecar 行为。"""
import io, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import video_verify as vv

out = []
out.append('ffprobe = %s' % vv.find_ffprobe())

# --- 1. catalog 时长查询 ---
out.append('')
out.append('catalog 11879 slot5 = %s (期望 162499)' % vv.catalog_duration_ms('11879', 5))
out.append('catalog 12059 slot5 = %s (期望 144677)' % vv.catalog_duration_ms('12059', 5))
out.append('catalog 999999 slot5 = %s (期望 None)' % vv.catalog_duration_ms('999999', 5))
out.append('catalog 11879 无diff = %s' % vv.catalog_duration_ms('11879', None))
out.append('catalog 11879 slot2 = %s' % vv.catalog_duration_ms('11879', 2))

# --- 2. 真实样本判定 ---
CACHE = os.path.join(HERE, 'cache', 'mp4')
for cid, name in (('12059', '12059_5.mp4'), ('11879', '11879_5.mp4')):
    p = os.path.join(CACHE, name)
    if os.path.isfile(p):
        ok, reason, info = vv.verify_mp4(p, cid, 5, force=True)
        out.append('')
        out.append('%s -> ok=%s reason=%s real=%s expected=%s ratio=%s'
                   % (name, ok, reason, info.get('real_ms'), info.get('expected_ms'), info.get('ratio')))
        # 二次调用应命中 sidecar
        ok2, reason2, info2 = vv.verify_mp4(p, cid, 5)
        out.append('  二次(应 cached=True): ok=%s reason=%s cached=%s' % (ok2, reason2, info2.get('cached')))
    else:
        out.append('%s 不存在，跳过' % name)

# --- 3. 合成边界样本：用 ffmpeg 造 5 秒 / 162.5 秒 视频测阈值 ---
FFMPEG = None
fp = vv.find_ffprobe()
if fp:
    FFMPEG = os.path.join(os.path.dirname(fp), 'ffmpeg.exe')
out.append('')
out.append('ffmpeg = %s (exists=%s)' % (FFMPEG, os.path.isfile(FFMPEG or '')))

tmpdir = tempfile.mkdtemp(prefix='vv_test_')
if FFMPEG and os.path.isfile(FFMPEG):
    cases = [
        ('5秒(应 too_short)', 5, '11879', 5),
        ('162秒(应 ok)', 162, '11879', 5),
        ('140秒(应 ok，比值0.86)', 140, '11879', 5),
        ('100秒(应 too_short，比值0.61)', 100, '11879', 5),
        ('250秒(应 too_long，比值1.54)', 250, '11879', 5),
    ]
    for label, secs, cid, slot in cases:
        p = os.path.join(tmpdir, 'case_%d.mp4' % secs)
        r = subprocess.run([FFMPEG, '-v', 'error', '-y', '-f', 'lavfi',
                            '-i', 'testsrc=size=180x180:rate=30', '-t', str(secs),
                            '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', p],
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=300)
        if not os.path.isfile(p):
            out.append('%-32s 生成失败: %s' % (label, r.stdout.decode('utf-8', 'replace')[-200:]))
            continue
        ok, reason, info = vv.verify_mp4(p, cid, slot, force=True)
        out.append('%-32s -> ok=%-5s reason=%-10s real=%s ratio=%s'
                   % (label, ok, reason, info.get('real_ms'), info.get('ratio')))

sys.stdout.write('\n'.join(out) + '\n')
