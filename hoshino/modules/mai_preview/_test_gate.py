# -*- coding: utf-8 -*-
"""集成自检：验证 phone_bridge 的缓存/上传两道守门都能拦住残缺视频。

不启动服务器，直接调用模块函数，通过 monkeypatch 观察行为。
"""
import asyncio, io, json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import config as cfg
import video_verify as vv
import phone_bridge as pb

out = []

# ---- 准备：独立临时缓存目录，避免污染真实缓存 ----
TMP = tempfile.mkdtemp(prefix='pb_gate_')
cfg.MP4_CACHE_DIR = TMP
print('临时缓存:', TMP)

FFMPEG = os.path.join(os.path.dirname(vv.find_ffprobe() or ''), 'ffmpeg.exe')

def make_mp4(path, secs):
    subprocess.run([FFMPEG, '-v', 'error', '-y', '-f', 'lavfi',
                    '-i', 'testsrc=size=180x180:rate=30', '-t', str(secs),
                    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', path],
                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=300, check=True)

# ---------- 测试 1：缓存守门 ----------
out.append('')
out.append('=== 测试1：get_cached_mp4 应拒绝残缺缓存 ===')
short = os.path.join(TMP, '11879_5.mp4')
make_mp4(short, 10)                       # 10 秒的残缺片（模拟手机残留测试片）
out.append('写入残缺片 %s (%d 字节)' % (os.path.basename(short), os.path.getsize(short)))

hit = pb.get_cached_mp4('11879', 5)
out.append('get_cached_mp4(11879, 5) = %r   [期望 None]' % hit)
out.append('  原文件是否已移走: %s  [期望 True]' % (not os.path.isfile(short)))
rej = os.path.join(TMP, 'rejected')
out.append('  rejected/ 内容: %s' % (sorted(os.listdir(rej)) if os.path.isdir(rej) else '不存在'))

# 换成完整片应通过
full = os.path.join(TMP, '12059_5.mp4')
make_mp4(full, 145)                      # catalog 12059 = 144.677s → 比值 1.002
out.append('写入完整片 %s (%d 字节)' % (os.path.basename(full), os.path.getsize(full)))
hit2 = pb.get_cached_mp4('12059', 5)
out.append('get_cached_mp4(12059, 5) = %r   [期望路径]' % (os.path.basename(hit2) if hit2 else None))

# ---------- 测试 2：上传守门 ----------
out.append('')
out.append('=== 测试2：handle_upload 应拒收残缺上传 ===')

class FakeRequest:
    def __init__(self, body, query, ctype='video/mp4'):
        self._body = body
        self.query = dict(query)
        self.headers = {}
        self.content_type = ctype
        self.remote = 'test'
        class C:
            async def read(self, n):
                if not self._buf:
                    return b''
                chunk = self._buf[:n]
                self._buf = self._buf[n:]
                return chunk
        self.content = C()
        self.content._buf = body
    async def json(self):
        return {}

def run_upload(path, chart_id, diff, req_id=''):
    body = open(path, 'rb').read()
    q = {'chart_id': str(chart_id), 'diff': str(diff), 'token': cfg.PHONE_BRIDGE_TOKEN}
    if req_id:
        q['request_id'] = req_id
    req = FakeRequest(body, q)
    loop = asyncio.new_event_loop()
    try:
        resp = loop.run_until_complete(pb.handle_upload(req))
        return resp.status, json.loads(resp.body.decode('utf-8'))
    finally:
        loop.close()

# 先给一个残缺上传
bad_src = os.path.join(TMP, 'test_upload_short.mp4')
make_mp4(bad_src, 8)
st, js = run_upload(bad_src, '11879', 5)
out.append('上传 8 秒片给 11879/5 → HTTP %s %s   [期望 422]' % (st, json.dumps(js, ensure_ascii=False)))

# 再给一个完整上传
good_src = os.path.join(TMP, 'test_upload_full.mp4')
make_mp4(good_src, 162)
st2, js2 = run_upload(good_src, '11879', 5)
out.append('上传 162 秒片给 11879/5 → HTTP %s status=%s   [期望 200/ok]' % (st2, js2.get('status')))
out.append('  落盘文件: %s' % os.path.basename(js2.get('file_path') or ''))
out.append('  该文件通过校验? %s' % (pb.get_cached_mp4('11879', 5) is not None))

# ---------- 测试 3：缺 chart_id/diff 时必须 fail-closed 拒收 ----------
out.append('')
out.append('=== 测试3：无 chart_id/diff 的上传应被拒收（fail-closed）===')
st3, js3 = run_upload(good_src, '', '', req_id='')
out.append('空 chart_id 上传 → HTTP %s reason=%s  [期望 422/missing_ids]'
           % (st3, js3.get('reason')))
leftover = [n for n in sorted(os.listdir(TMP)) if n.startswith('video_')]
out.append('  兜底名残留文件: %s  [期望 空]' % leftover)

# ---------- 测试 4：路径穿越必须被拦住 ----------
out.append('')
out.append('=== 测试4：chart_id 里的路径穿越应被拒收 ===')
for evil in ('..\\..\\__traversal_probe', '..%2F..%2F__traversal_probe',
             'C:\\Users\\Administrator\\AppData\\Local\\Temp\\__abs_probe'):
    st4, js4 = run_upload(good_src, evil, 9)
    out.append('chart_id=%-56s → HTTP %s reason=%s  [期望 422]'
               % (evil[:56], st4, js4.get('reason')))
outside = os.path.normpath(os.path.join(TMP, '..', '..', '__traversal_probe_9.mp4'))
out.append('  缓存目录外是否被写出: %s  [期望 False]' % os.path.isfile(outside))

out.append('')
print('\n'.join(out))

# 临时目录里有 ffmpeg 现造的几百 MB 视频，跑完就删，否则 %TEMP% 会越堆越大。
shutil.rmtree(TMP, ignore_errors=True)
print('已清理临时目录:', TMP)
