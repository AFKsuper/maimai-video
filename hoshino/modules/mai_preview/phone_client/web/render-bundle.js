(() => {
  // ../adx-dl/packages/maimai-chart-engine/src/utils/constants.ts
  var BASE_APPROACH_TIME_MS = 2250;
  var ANSWER_SOUND_BASE_OFFSET_MS = -50;
  var NOTE_VISIBILITY_AFTER_MS = 0;
  var NOTE_HIT_EFFECT_DURATION_MS = 450;
  var BUTTON_ANGLE_STEP = Math.PI / 4;
  var BUTTON_ANGLE_OFFSET = Math.PI / 8;
  var BASE_ANGLE = -Math.PI / 2;
  var PANEL_RADIUS_UNITS = 480;
  var NOTE_SIZE_RATIO = 1 / 12.5;
  var TAP_INNER_RING_RATIO = 0.65;
  var APPROACH_START_SCALE = 0.25;
  var BUTTON_MARKER_RATIO = 9 / 300;
  var NOTE_STROKE_WIDTH_RATIO = 2 / 300;
  var JUDGMENT_LINE_WIDTH_RATIO = 3 / 300;
  var SLIDE_ARROW_WIDTH_RATIO = 16.6 / 300;
  var SLIDE_ARROW_HEIGHT_RATIO = 44.6 / 300;
  var SLIDE_ARROW_SPAN_RATIO = 12.2 / 300;
  var SLIDE_ARROW_PADDING_RATIO = 9.5 / 300;
  var SLIDE_STAR_SIZE_RATIO = 1.6 / 10.42;
  var SLIDE_STAR_WAITING_MIN_SCALE = 0.5;
  var SLIDE_WIFI_LINE_WIDTH_RATIO = 19.2 / 300;
  var SLIDE_WIFI_CORNER_FRACS = [
    0,
    0.094,
    0.178,
    0.266,
    0.355,
    0.462,
    0.57,
    0.674,
    0.779,
    0.884,
    1
  ];
  var HOLD_WIDTH_RATIO = 1.5;
  var HOLD_INNER_RATIO = 0.62;
  var HOLD_ACTIVE_CYCLE_MS = 16e3 / 60;
  var HOLD_ACTIVE_BRIGHTNESS_CURVE = [
    0.714,
    0.51,
    0.286,
    0.095,
    0,
    0.01,
    0.095,
    0.293,
    0.552,
    0.762,
    0.917,
    0.976,
    1,
    0.995,
    0.969,
    0.917
  ];
  var HOLD_ACTIVE_BRIGHTNESS_MIN = 0.82;
  var HOLD_ACTIVE_BRIGHTNESS_MAX = 1;
  var HOLD_ACTIVE_GLOW_RATIO = 0.06;
  var HOLD_ACTIVE_GLOW_RAMP = [
    [0, 0.99, 1.11, 1.29],
    [0.1, 0.99, 0.98, 1.04],
    [0.2, 0.99, 0.79, 0.72],
    [0.3, 0.98, 0.63, 0.62],
    [0.4, 0.93, 0.49, 0.62],
    [0.5, 0.76, 0.28, 0.43],
    [0.6, 0.54, 0.08, 0.13],
    [0.7, 0.41, 0.02, 0.05],
    [0.8, 0.3, 0.01, 0.04],
    [0.9, 0.24, 0.02, 0.05]
  ];
  var TOUCH_APPROACH_MULTIPLIER = 0.9;
  var TOUCH_CENTER_DOT_RATIO = 1 / 37.5;
  var TOUCH_PETAL_OPEN_RATIO = 1 / 6.25;
  var TOUCH_PETAL_CLOSED_RATIO = 1 / 12.5;
  var TOUCH_HOLD_CENTRE_BURST_ANGLE = -Math.PI / 6;
  var TOUCH_SENSOR_RADII = {
    A: 400 / PANEL_RADIUS_UNITS,
    B: 220 / PANEL_RADIUS_UNITS,
    C: 0,
    D: 410 / PANEL_RADIUS_UNITS,
    E: 310 / PANEL_RADIUS_UNITS
  };
  var HI_SPEED_DEFAULT = 6;
  var HI_SPEED_CONVERSION_FACTOR = 2 / 3 * 0.9;
  var NOTE_LIGHTEN_RATIO = 0.18;
  var DDR_DARKEN_RATIO = 0.25;
  var COLORS = {
    BLACK: "#000000",
    TAP_PINK: "#ff69b4",
    TAP_GRADIENT_START: "#FD197D",
    TAP_GRADIENT_END: "#FF7DD5",
    SIMULTANEOUS_GOLD: "#FFD700",
    SIMULTANEOUS_GRADIENT_START: "#FCB600",
    SIMULTANEOUS_GRADIENT_END: "#FFFE00",
    BREAK_ORANGE: "#FF8C00",
    BREAK_GRADIENT_START: "#FFB347",
    BREAK_GRADIENT_END: "#FF6600",
    SLIDE_CYAN: "#01FBFD",
    SLIDE_ARROW_RIGHT: "#FF9001",
    SLIDE_PINK: "#ff69b4",
    SLIDE_SIMULTANEOUS: "#FFED24",
    TOUCH_CYAN: "#00FFFF",
    TOUCH_BLUE: "#0080FF",
    /** 双押 Touch 花瓣渐变起点；与 DDR_YELLOW 同值但用途无关，不可互换。 */
    TOUCH_SIMULTANEOUS_YELLOW: "#FFFF00",
    TOUCH_HOLD_RED: "#F74601",
    TOUCH_HOLD_YELLOW: "#F6ED00",
    TOUCH_HOLD_GREEN: "#12A86A",
    TOUCH_HOLD_BLUE: "#0097F6",
    EX_OVERLAY_BREAK: "rgba(255, 200, 120, 0.8)",
    EX_OVERLAY_SIMULTANEOUS: "rgba(255, 245, 150, 0.8)",
    EX_OVERLAY_NORMAL: "rgba(255, 180, 210, 0.8)",
    WHITE: "#ffffff",
    HIT_EFFECT_GOLD: "#F5EA72",
    // 节拍着色模式颜色映射（按拍位分频）
    DDR_RED: "#FF0000",
    // 1/1（节拍内）
    DDR_BLUE: "#0066FF",
    // 1/2
    DDR_YELLOW: "#FFFF00",
    // 1/4
    DDR_GREEN: "#00FF00",
    // 1/8+
    DDR_ORANGE: "#FF8800",
    // 1/8（扩展）
    DDR_CYAN: "#00DDFF"
    // 1/6（扩展）
  };
  var RAINBOW_SPEED_DEG_PER_SEC = 60;

  // ../adx-dl/packages/maimai-chart-engine/src/utils/touchGeometry.ts
  var SENSOR_MIRROR_MAPS = {
    horizontal: {
      AB: [0, 8, 7, 6, 5, 4, 3, 2, 1],
      DE: [0, 1, 8, 7, 6, 5, 4, 3, 2]
    },
    vertical: {
      AB: [0, 4, 3, 2, 1, 8, 7, 6, 5],
      DE: [0, 5, 4, 3, 2, 1, 8, 7, 6]
    },
    rotate180: {
      ABDE: [0, 5, 6, 7, 8, 1, 2, 3, 4]
    }
  };
  function mirrorTouchSensor(touchPosition, mirrorMode) {
    if (mirrorMode === "none") return touchPosition;
    const region = touchPosition[0];
    const sensorNum = touchPosition.length > 1 ? parseInt(touchPosition[1]) : 0;
    if (region === "C") {
      return touchPosition;
    }
    const map = SENSOR_MIRROR_MAPS[mirrorMode];
    if (!map) return touchPosition;
    const key = mirrorMode === "rotate180" ? "ABDE" : region === "A" || region === "B" ? "AB" : "DE";
    const mapping = map[key];
    if (!mapping) return touchPosition;
    return `${region}${mapping[sensorNum]}`;
  }
  function touchSensorPoint(touchPosition, { centerX, centerY, radius, mirrorMode }) {
    const mirrored = mirrorTouchSensor(touchPosition, mirrorMode);
    const region = mirrored[0];
    const sensorNum = mirrored.length > 1 ? parseInt(mirrored[1]) : 0;
    if (region === "C") {
      return { x: centerX, y: centerY };
    }
    const distance = radius * (TOUCH_SENSOR_RADII[region] || 0);
    const angle = region === "D" || region === "E" ? BASE_ANGLE + (sensorNum - 1) * BUTTON_ANGLE_STEP : BASE_ANGLE + BUTTON_ANGLE_OFFSET + (sensorNum - 1) * BUTTON_ANGLE_STEP;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  }

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/BaseRenderer.ts
  function mixHexColor(color, target, amount) {
    const parse = (value) => Number.parseInt(value, 16);
    const r2 = parse(color.slice(1, 3));
    const g = parse(color.slice(3, 5));
    const b2 = parse(color.slice(5, 7));
    const tr = parse(target.slice(1, 3));
    const tg = parse(target.slice(3, 5));
    const tb = parse(target.slice(5, 7));
    const mix = (from, to) => Math.round(from + (to - from) * amount);
    const toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(mix(r2, tr))}${toHex(mix(g, tg))}${toHex(mix(b2, tb))}`;
  }
  function scaleHexBrightness(color, factor) {
    const channel = (offset) => {
      const value = Math.round(Number.parseInt(color.slice(offset, offset + 2), 16) * factor);
      return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");
    };
    return `#${channel(1)}${channel(3)}${channel(5)}`;
  }
  function getGradientColors(ddrColor, isBreak, isSimultaneous) {
    if (ddrColor) {
      return [ddrColor, mixHexColor(ddrColor, COLORS.BLACK, DDR_DARKEN_RATIO)];
    }
    if (isBreak) {
      return [COLORS.BREAK_GRADIENT_START, COLORS.BREAK_GRADIENT_END];
    }
    if (isSimultaneous) {
      return [COLORS.SIMULTANEOUS_GRADIENT_START, COLORS.SIMULTANEOUS_GRADIENT_END];
    }
    return [COLORS.TAP_GRADIENT_START, COLORS.TAP_GRADIENT_END];
  }
  var BaseRenderer = class {
    constructor(context) {
      this.context = context;
    }
    updateContext(context) {
      Object.assign(this.context, context);
    }
    /** 按当前镜像模式转换按钮编号 1~8。 */
    mirrorPosition(position) {
      const mode = this.context.config.mirrorMode;
      if (mode === "none") return position;
      const mirrorH = [0, 8, 7, 6, 5, 4, 3, 2, 1];
      const mirrorV = [0, 4, 3, 2, 1, 8, 7, 6, 5];
      const rotate180 = [0, 5, 6, 7, 8, 1, 2, 3, 4];
      switch (mode) {
        case "horizontal":
          return mirrorH[position];
        case "vertical":
          return mirrorV[position];
        case "rotate180":
          return rotate180[position];
        default:
          return position;
      }
    }
    /** 按当前镜像模式转换 Touch 传感器位置（C 区不变，外圈按对称轴映射）。 */
    mirrorTouchPosition(touchPosition) {
      return mirrorTouchSensor(touchPosition, this.context.config.mirrorMode);
    }
    /** Touch 传感器在画布上的像素坐标（已应用镜像变换，"C" 对应圆心）。 */
    getTouchPosition(touchPosition) {
      const { centerX, centerY, radius, config } = this.context;
      return touchSensorPoint(touchPosition, {
        centerX,
        centerY,
        radius,
        mirrorMode: config.mirrorMode
      });
    }
    /** backing store 相对逻辑坐标的缩放（含 DPR）。 */
    getBackingScale() {
      return this.context.canvas.width / (this.context.centerX * 2);
    }
    /** 获取按钮在画布上的弧度角（已应用镜像变换）。 */
    getButtonAngle(position) {
      const mirroredPos = this.mirrorPosition(position);
      return BASE_ANGLE + BUTTON_ANGLE_OFFSET + (mirroredPos - 1) * BUTTON_ANGLE_STEP;
    }
    /** 获取按钮在判定圈上的像素坐标。 */
    getButtonPosition(position) {
      const angle = this.getButtonAngle(position);
      return {
        x: this.context.centerX + Math.cos(angle) * this.context.radius,
        y: this.context.centerY + Math.sin(angle) * this.context.radius
      };
    }
    /** 全局进场时长（ms）；开启 alwaysKeepHiSpeed 时除以播放倍速，避免视觉移速随回放倍速变快。 */
    getApproachTimeMs() {
      if (this.context.config.alwaysKeepHiSpeed) {
        return this.context.baseApproachTimeMs / (this.context.hiSpeed / this.context.config.playbackSpeed);
      }
      return this.context.baseApproachTimeMs / this.context.hiSpeed;
    }
    /** 音符进场时长（ms），叠加了音符自身流速倍率（<HS*x>）；负流速取绝对值，方向由 getNoteApproachDir 处理。 */
    getNoteApproachTimeMs(note) {
      return this.getApproachTimeMs() / (Math.abs(note.hiSpeed ?? 1) || 1);
    }
    /** 进场移动方向：+1 常规从圆心向外，-1（负流速）从圈外向内。 */
    getNoteApproachDir(note) {
      return (note.hiSpeed ?? 1) < 0 ? -1 : 1;
    }
    distanceToCenter(x2, y2) {
      return Math.sqrt(Math.pow(x2 - this.context.centerX, 2) + Math.pow(y2 - this.context.centerY, 2));
    }
    scaleByRadius(ratio) {
      return ratio * this.context.radius;
    }
    getNoteStrokeWidth() {
      return this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
    }
    /** 对当前路径描边，未指定线宽时使用音符标准线宽。 */
    stroke(color, width) {
      const ctx = this.context.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = width ?? this.getNoteStrokeWidth();
      ctx.stroke();
    }
    /** 拍数（beat）按 BPM 换算为毫秒（ms）。 */
    durationToMs(duration, bpm) {
      return 6e4 * duration / bpm;
    }
    /** 节拍着色（DDR 模式）颜色，按 1/1、1/2、1/4 拍分频匹配，扩展模式支持 1/8、1/6 拍，其余默认绿色；未开启返回 null。 */
    getDdrColor(timing) {
      if (!this.context.config.ddrColorMode) {
        return null;
      }
      const epsilon = 1e-3;
      const fractional = Math.abs(timing % 1);
      if (fractional < epsilon || fractional > 1 - epsilon) {
        return COLORS.DDR_RED;
      }
      const halfFrac = Math.abs(timing % 0.5);
      if (halfFrac < epsilon || halfFrac > 0.499) {
        return COLORS.DDR_BLUE;
      }
      const quarterFrac = Math.abs(timing % 0.25);
      if (quarterFrac < epsilon || quarterFrac > 0.249) {
        return COLORS.DDR_YELLOW;
      }
      if (this.context.config.ddrColorExtended) {
        const eighthFrac = Math.abs(timing % 0.125);
        if (eighthFrac < epsilon || eighthFrac > 0.124) {
          return COLORS.DDR_ORANGE;
        }
        const sixthFrac = 1 / 6;
        const sixthRemainder = Math.abs(timing % sixthFrac);
        if (sixthRemainder < epsilon || sixthRemainder > sixthFrac - epsilon) {
          return COLORS.DDR_CYAN;
        }
      }
      return COLORS.DDR_GREEN;
    }
    /** 在 save/restore 中执行绘图，finally 保证抛错时也能可靠恢复 Canvas 状态。 */
    withContext(drawFn) {
      this.context.ctx.save();
      try {
        drawFn();
      } finally {
        this.context.ctx.restore();
      }
    }
    /** 构建圆形路径（不含 fill/stroke）。 */
    drawCircle(x2, y2, radius) {
      this.context.ctx.beginPath();
      this.context.ctx.arc(x2, y2, radius, 0, Math.PI * 2);
    }
    mixHexColor(color, target, amount) {
      return mixHexColor(color, target, amount);
    }
    scaleHexBrightness(color, factor) {
      return scaleHexBrightness(color, factor);
    }
    /** 构建圆环闭合路径（外顺内逆，非零环绕自动镂空）。 */
    drawRing(x2, y2, innerRadius, outerRadius) {
      this.context.ctx.beginPath();
      this.context.ctx.arc(x2, y2, outerRadius, 0, Math.PI * 2, false);
      this.context.ctx.arc(x2, y2, innerRadius, 0, Math.PI * 2, true);
      this.context.ctx.closePath();
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/NoteRenderer.ts
  var INVISIBLE_NOTE_POSITION = Object.freeze({
    x: 0,
    y: 0,
    scale: 0,
    visible: false
  });
  var TAP_SPRITE_HALF_RATIO = 1.7;
  var TAP_SPRITE_SUPERSAMPLE = 2;
  var TAP_SPRITE_CROP_MARGIN_PX = 1;
  var NoteRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
      // Tap 贴图缓存（按方位/配色/EX 键），radius 或 mirrorMode 变化时失效
      this.tapSpriteCache = /* @__PURE__ */ new Map();
      this.tapSpriteBasis = "";
    }
    /** 获取按键在判定圈上的坐标。 */
    getPositionOnRing(position) {
      return this.getButtonPosition(position);
    }
    /** 获取按键弧度角。 */
    getAngle(position) {
      return this.getButtonAngle(position);
    }
    /** 计算音符当前渲染位置与缩放；超出可见范围返回 INVISIBLE_NOTE_POSITION。 */
    calculateNotePosition(note, _currentBeat, currentTimeMs) {
      const position = note.position;
      const angle = this.getButtonAngle(position);
      const timeDiff = note.timingMs - currentTimeMs;
      const approachTime = this.getNoteApproachTimeMs(note);
      let holdWindow = NOTE_VISIBILITY_AFTER_MS;
      if ("isHoldStart" in note && note.isHoldStart && "duration" in note) {
        holdWindow = this.durationToMs(note.duration, note.bpm);
      }
      if (timeDiff > approachTime || timeDiff < -holdWindow) {
        return INVISIBLE_NOTE_POSITION;
      }
      const dir = this.getNoteApproachDir(note);
      const halfApproach = approachTime / 2;
      let distance;
      let scale;
      if (timeDiff > halfApproach) {
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1));
        scale = 1 - (timeDiff - halfApproach) / halfApproach;
      } else if (timeDiff >= 0) {
        const progress = 1 - timeDiff / halfApproach;
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1 + 0.75 * progress));
        scale = 1;
      } else if ("isHoldStart" in note && note.isHoldStart) {
        distance = this.context.radius;
        scale = 1;
      } else {
        const fadeProgress = 1 + -timeDiff / halfApproach;
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1 + 0.75 * fadeProgress));
        scale = 1;
      }
      return {
        x: this.context.centerX + Math.cos(angle) * distance,
        y: this.context.centerY + Math.sin(angle) * distance,
        scale,
        visible: true
      };
    }
    /** 渲染单个音符接近弧（中心主弧与两侧渐隐拖影）。 */
    renderApproachArc(position, noteX, noteY, color) {
      const angle = this.getButtonAngle(position);
      const distance = this.distanceToCenter(noteX, noteY);
      const ctx = this.context.ctx;
      const centerX = this.context.centerX;
      const centerY = this.context.centerY;
      const trailStep = Math.PI / 8 / 4;
      const lineWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
      ctx.save();
      for (let i2 = 4; i2 >= 0; i2--) {
        const alpha = i2 === 0 ? 0.4 : 0.4 * (1 - i2 / 5);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        if (i2 === 0) {
          ctx.arc(centerX, centerY, distance, angle - Math.PI / 8, angle + Math.PI / 8, false);
        } else {
          ctx.arc(
            centerX,
            centerY,
            distance,
            angle - Math.PI / 8 - i2 * trailStep,
            angle - Math.PI / 8 - (i2 - 1) * trailStep,
            false
          );
          ctx.moveTo(
            centerX + Math.cos(angle + Math.PI / 8 + (i2 - 1) * trailStep) * distance,
            centerY + Math.sin(angle + Math.PI / 8 + (i2 - 1) * trailStep) * distance
          );
          ctx.arc(
            centerX,
            centerY,
            distance,
            angle + Math.PI / 8 + (i2 - 1) * trailStep,
            angle + Math.PI / 8 + i2 * trailStep,
            false
          );
        }
        this.stroke(color, lineWidth);
      }
      ctx.restore();
    }
    /** 批量渲染接近弧：同心弧按 (颜色, 拖影档) 合并绘制，每档一次 stroke。 */
    renderApproachArcsBatch(arcs) {
      if (arcs.length === 0) return;
      const ctx = this.context.ctx;
      const cx = this.context.centerX;
      const cy = this.context.centerY;
      const trailStep = Math.PI / 8 / 4;
      const lineWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
      const byColor = /* @__PURE__ */ new Map();
      for (const arc of arcs) {
        const group = byColor.get(arc.color);
        if (group) group.push(arc);
        else byColor.set(arc.color, [arc]);
      }
      ctx.save();
      ctx.lineWidth = lineWidth;
      for (const [color, group] of byColor) {
        ctx.strokeStyle = color;
        for (let i2 = 4; i2 >= 0; i2--) {
          ctx.globalAlpha = i2 === 0 ? 0.4 : 0.4 * (1 - i2 / 5);
          ctx.beginPath();
          for (const arc of group) {
            const angle = this.getButtonAngle(arc.position);
            const d2 = arc.distance;
            if (i2 === 0) {
              ctx.moveTo(
                cx + Math.cos(angle - Math.PI / 8) * d2,
                cy + Math.sin(angle - Math.PI / 8) * d2
              );
              ctx.arc(cx, cy, d2, angle - Math.PI / 8, angle + Math.PI / 8, false);
            } else {
              const leftStart = angle - Math.PI / 8 - i2 * trailStep;
              ctx.moveTo(cx + Math.cos(leftStart) * d2, cy + Math.sin(leftStart) * d2);
              ctx.arc(cx, cy, d2, leftStart, angle - Math.PI / 8 - (i2 - 1) * trailStep, false);
              const rightStart = angle + Math.PI / 8 + (i2 - 1) * trailStep;
              ctx.moveTo(cx + Math.cos(rightStart) * d2, cy + Math.sin(rightStart) * d2);
              ctx.arc(cx, cy, d2, rightStart, angle + Math.PI / 8 + i2 * trailStep, false);
            }
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    /** 渲染双押圆弧连接线（取两键间短弧；间距 4 键正对时连整圈）。 */
    renderSimultaneousConnector(startPos, endPos, distance, color) {
      const startAngle = this.getButtonAngle(startPos);
      const endAngle = this.getButtonAngle(endPos);
      let angleDiff = endPos - startPos;
      while (angleDiff > 4) angleDiff -= 8;
      while (angleDiff < -4) angleDiff += 8;
      const isFullCircle = Math.abs(angleDiff) === 4;
      this.withContext(() => {
        const ctx = this.context.ctx;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        if (isFullCircle) {
          ctx.arc(this.context.centerX, this.context.centerY, distance, 0, Math.PI * 2);
        } else {
          const [arcStart, arcEnd] = angleDiff > 0 ? [startAngle, endAngle] : [endAngle, startAngle];
          ctx.arc(this.context.centerX, this.context.centerY, distance, arcStart, arcEnd, false);
        }
        this.stroke(color);
      });
    }
    /** 渲染 EX 发光外环。 */
    renderExRing(x2, y2, noteSize, noteType = "tap", isSimultaneous = false, scaleFactor = 1) {
      const innerRadius = noteSize;
      const outerRadius = noteSize * 1.19 * scaleFactor;
      let color;
      if (noteType === "break") {
        color = COLORS.EX_OVERLAY_BREAK;
      } else if (isSimultaneous) {
        color = COLORS.EX_OVERLAY_SIMULTANEOUS;
      } else {
        color = COLORS.EX_OVERLAY_NORMAL;
      }
      this.withContext(() => {
        this.drawRing(x2, y2, innerRadius, outerRadius);
        this.context.ctx.fillStyle = color;
        this.context.ctx.fill();
      });
    }
    /** 渲染 Break 尖角标记（尖端朝外）。 */
    renderBreakTriangle(x2, y2, size, position) {
      const angle = this.getButtonAngle(position);
      const triangleSize = size * 1.4;
      const tipAngle = angle;
      const leftAngle = angle + Math.PI - Math.PI / 3;
      const rightAngle = angle + Math.PI + Math.PI / 3;
      const tipX = x2 + Math.cos(tipAngle) * triangleSize;
      const tipY = y2 + Math.sin(tipAngle) * triangleSize;
      const leftX = x2 + Math.cos(leftAngle) * triangleSize;
      const leftY = y2 + Math.sin(leftAngle) * triangleSize;
      const rightX = x2 + Math.cos(rightAngle) * triangleSize;
      const rightY = y2 + Math.sin(rightAngle) * triangleSize;
      this.withContext(() => {
        const ctx = this.context.ctx;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(leftX, leftY);
        ctx.lineTo(rightX, rightY);
        ctx.closePath();
        this.stroke("rgba(255, 255, 255, 0.8)", this.scaleByRadius(4 / 300));
      });
    }
    getTapRingColors(ddrColor, isBreak, isSimultaneous) {
      return getGradientColors(ddrColor, isBreak, isSimultaneous);
    }
    /** 渲染四段方向渐变圆环（起始角与按键方位对齐）。 */
    renderDirectionalTapRing(x2, y2, innerRadius, outerRadius, position, colors) {
      const ctx = this.context.ctx;
      const startAngle = this.getButtonAngle(position);
      const lightColor = this.mixHexColor(colors[0], "#ffffff", NOTE_LIGHTEN_RATIO);
      for (let i2 = 0; i2 < 4; i2++) {
        const sectorStart = startAngle + i2 * Math.PI / 2;
        const sectorEnd = sectorStart + Math.PI / 2;
        const midR = (innerRadius + outerRadius) / 2;
        const x0 = x2 + Math.cos(sectorStart) * midR;
        const y0 = y2 + Math.sin(sectorStart) * midR;
        const x1 = x2 + Math.cos(sectorEnd) * midR;
        const y1 = y2 + Math.sin(sectorEnd) * midR;
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(1, colors[1]);
        ctx.beginPath();
        ctx.arc(x2, y2, outerRadius, sectorStart, sectorEnd, false);
        ctx.arc(x2, y2, innerRadius, sectorEnd, sectorStart, true);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
    /** 渲染 Tap 音符（优先用离屏精灵，DDR 节拍着色模式回退矢量绘制）。 */
    renderTapNote(x2, y2, noteScale, position, isBreak, isSimultaneous, isEx, timing, highlightExScale = 1) {
      if (this.context.config.ddrColorMode) {
        this.drawTapNoteVector(
          x2,
          y2,
          noteScale,
          position,
          isBreak,
          isSimultaneous,
          isEx,
          timing,
          highlightExScale
        );
        return;
      }
      const sprite = this.getTapSprite(position, isBreak, isSimultaneous, isEx, highlightExScale);
      let cropSize = Math.ceil(
        this.getTapSpriteCropHalf(isEx, highlightExScale) * 2 * TAP_SPRITE_SUPERSAMPLE
      );
      if (cropSize % 2 !== sprite.width % 2) cropSize++;
      cropSize = Math.min(cropSize, sprite.width);
      const sourceOffset = (sprite.width - cropSize) / 2;
      const size = cropSize / TAP_SPRITE_SUPERSAMPLE * noteScale;
      this.context.ctx.drawImage(
        sprite,
        sourceOffset,
        sourceOffset,
        cropSize,
        cropSize,
        x2 - size / 2,
        y2 - size / 2,
        size,
        size
      );
    }
    /** 计算 Tap 贴图实际墨迹裁剪半径（逻辑像素，EX 为外环外径，普通为外黑边）。 */
    getTapSpriteCropHalf(isEx, highlightExScale) {
      const outerRadius = this.scaleByRadius(NOTE_SIZE_RATIO) * 1.36;
      const strokeW = this.getNoteStrokeWidth();
      const ink = isEx ? Math.max(outerRadius * 1.19 * highlightExScale, outerRadius + strokeW / 2) : outerRadius + strokeW * 1.5;
      return ink + TAP_SPRITE_CROP_MARGIN_PX;
    }
    /**
     * 校验已烘焙 Tap 精灵的裁剪矩形是否完整覆盖墨迹（用于防回归手工推导漏裁）。
     * 含 getImageData 开销，严禁在渲染热路径中调用；只能校验当前缓存已烘焙的贴图。
     */
    validateTapSpriteCrops() {
      const violations = [];
      for (const [key, sprite] of this.tapSpriteCache) {
        const parts = key.split("|");
        const isEx = parts[3] === "1";
        const highlightExScale = Number(parts[4]);
        let cropSize = Math.ceil(
          this.getTapSpriteCropHalf(isEx, highlightExScale) * 2 * TAP_SPRITE_SUPERSAMPLE
        );
        if (cropSize % 2 !== sprite.width % 2) cropSize++;
        cropSize = Math.min(cropSize, sprite.width);
        const inset = (sprite.width - cropSize) / 2;
        const spriteCtx = sprite.getContext("2d");
        if (!spriteCtx) continue;
        const { data } = spriteCtx.getImageData(0, 0, sprite.width, sprite.height);
        let minX = sprite.width;
        let minY = sprite.height;
        let maxX = -1;
        let maxY = -1;
        for (let y2 = 0; y2 < sprite.height; y2++) {
          for (let x2 = 0; x2 < sprite.width; x2++) {
            if (data[(y2 * sprite.width + x2) * 4 + 3] === 0) continue;
            if (x2 < minX) minX = x2;
            if (x2 > maxX) maxX = x2;
            if (y2 < minY) minY = y2;
            if (y2 > maxY) maxY = y2;
          }
        }
        if (maxX < 0) continue;
        if (minX < inset || minY < inset || maxX >= sprite.width - inset || maxY >= sprite.height - inset) {
          violations.push(
            `tap sprite ${key}: ink [${minX},${minY}]-[${maxX},${maxY}] escapes crop inset ${inset} of ${sprite.width}px`
          );
        }
      }
      return violations;
    }
    /** 获取或烘焙 Tap 贴图，radius 或 mirrorMode 变化时失效。 */
    getTapSprite(position, isBreak, isSimultaneous, isEx, highlightExScale) {
      const basis = `${this.context.radius}|${this.context.config.mirrorMode}`;
      if (basis !== this.tapSpriteBasis) {
        this.tapSpriteCache.clear();
        this.tapSpriteBasis = basis;
      }
      const key = `${position}|${+isBreak}|${+isSimultaneous}|${+isEx}|${highlightExScale}`;
      let sprite = this.tapSpriteCache.get(key);
      if (sprite) return sprite;
      const half = this.scaleByRadius(NOTE_SIZE_RATIO) * 1.36 * TAP_SPRITE_HALF_RATIO;
      sprite = document.createElement("canvas");
      sprite.width = sprite.height = Math.max(2, Math.ceil(half * 2 * TAP_SPRITE_SUPERSAMPLE));
      const offscreenCtx = sprite.getContext("2d");
      offscreenCtx.setTransform(
        TAP_SPRITE_SUPERSAMPLE,
        0,
        0,
        TAP_SPRITE_SUPERSAMPLE,
        sprite.width / 2,
        sprite.height / 2
      );
      const mainCtx = this.context.ctx;
      this.context.ctx = offscreenCtx;
      try {
        this.drawTapNoteVector(0, 0, 1, position, isBreak, isSimultaneous, isEx, 0, highlightExScale);
      } finally {
        this.context.ctx = mainCtx;
      }
      this.tapSpriteCache.set(key, sprite);
      return sprite;
    }
    /** 矢量绘制 Tap 各图层（离屏烘焙或 DDR 模式使用）。 */
    drawTapNoteVector(x2, y2, noteScale, position, isBreak, isSimultaneous, isEx, timing, highlightExScale = 1) {
      const baseSize = this.scaleByRadius(NOTE_SIZE_RATIO) * noteScale * 1.36;
      const outerRadius = baseSize;
      const innerRadius = baseSize * TAP_INNER_RING_RATIO;
      this.withContext(() => {
        const ctx = this.context.ctx;
        if (isEx) {
          this.renderExRing(
            x2,
            y2,
            outerRadius,
            isBreak ? "break" : "tap",
            isSimultaneous,
            highlightExScale
          );
        }
        const ddrColor = this.getDdrColor(timing);
        const ringColors = this.getTapRingColors(ddrColor, isBreak, isSimultaneous);
        this.renderDirectionalTapRing(x2, y2, innerRadius, outerRadius, position, ringColors);
        const strokeW = this.getNoteStrokeWidth();
        const blackBandW = strokeW;
        if (!isEx) {
          this.drawCircle(x2, y2, outerRadius + strokeW / 2 + blackBandW / 2);
          this.stroke(COLORS.BLACK, blackBandW);
        }
        const innerBlackR = innerRadius - strokeW / 2 - blackBandW / 2;
        if (innerBlackR > 0) {
          this.drawCircle(x2, y2, innerBlackR);
          this.stroke(COLORS.BLACK, blackBandW);
        }
        this.drawCircle(x2, y2, outerRadius);
        this.stroke(COLORS.WHITE, strokeW);
        this.drawCircle(x2, y2, innerRadius);
        this.stroke(COLORS.WHITE, strokeW);
        const centerSize = outerRadius * 0.15;
        this.drawCircle(x2, y2, centerSize);
        if (ddrColor) {
          ctx.fillStyle = ddrColor;
        } else if (isBreak) {
          ctx.fillStyle = COLORS.BREAK_ORANGE;
        } else {
          ctx.fillStyle = isSimultaneous ? COLORS.SIMULTANEOUS_GOLD : COLORS.TAP_PINK;
        }
        ctx.fill();
      });
    }
    /** 渲染 Break 序号。 */
    renderBreakIndex(x2, y2, scale, index) {
      const fontSize = Math.round(30 * this.context.radius / 300 * scale);
      this.withContext(() => {
        const ctx = this.context.ctx;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = COLORS.WHITE;
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(`${index}`, x2, y2);
      });
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/utils/slideAreaSteps.ts
  var MIRROR_KEYS = [-1, 1, 8, 7, 6, 5, 4, 3, 2];
  var UPPER_HALF = /* @__PURE__ */ new Set([1, 2, 7, 8]);
  function mirrorKey(key) {
    return MIRROR_KEYS[key] ?? key;
  }
  function isUpperHalf(key) {
    return UPPER_HALF.has(key);
  }
  function relativeEnd(startPos, endPos) {
    const d2 = ((endPos - startPos) % 8 + 8) % 8;
    return d2 + 1;
  }
  function detectSlideShape(slideType, startPos, endPos, midPos) {
    const rel = relativeEnd(startPos, endPos);
    switch (slideType) {
      case "-": {
        if (rel < 3 || rel > 7) return null;
        const normRel = rel > 5 ? 10 - rel : rel;
        const mirror = normRel !== rel;
        return { shape: `line${normRel}`, mirror };
      }
      case ">":
        return isUpperHalf(startPos) ? { shape: `circle${rel}`, mirror: false } : { shape: `circle${mirrorKey(rel)}`, mirror: true };
      case "<":
        return !isUpperHalf(startPos) ? { shape: `circle${rel}`, mirror: false } : { shape: `circle${mirrorKey(rel)}`, mirror: true };
      case "^":
        if (rel === 1 || rel === 5) return null;
        return rel < 5 ? { shape: `circle${rel}`, mirror: false } : { shape: `circle${mirrorKey(rel)}`, mirror: true };
      case "v":
        if (rel === 5) return null;
        return { shape: `v${rel}`, mirror: false };
      case "pp":
        return { shape: `ppqq${rel}`, mirror: false };
      case "qq":
        return { shape: `ppqq${mirrorKey(rel)}`, mirror: true };
      case "p":
        return { shape: `pq${rel}`, mirror: false };
      case "q":
        return { shape: `pq${mirrorKey(rel)}`, mirror: true };
      case "s":
        if (rel !== 5) return null;
        return { shape: "s", mirror: false };
      case "z":
        if (rel !== 5) return null;
        return { shape: "s", mirror: true };
      case "V": {
        if (midPos === void 0) return null;
        const leftCorner = (startPos + 5) % 8 + 1;
        const rightCorner = (startPos + 1) % 8 + 1;
        if (midPos === leftCorner && rel >= 2 && rel <= 5) {
          return { shape: `L${rel}`, mirror: false };
        }
        const mirrorRel = (8 - (rel - 1)) % 8 + 1;
        if (midPos === rightCorner && mirrorRel >= 2 && mirrorRel <= 5) {
          return { shape: `L${mirrorRel}`, mirror: true };
        }
        return null;
      }
      case "w":
        return { shape: "wifi", mirror: false };
      default:
        return null;
    }
  }
  var SLIDE_AREA_STEP_MAP = {
    line3: [0, 2, 8, 13],
    line4: [0, 3, 8, 12, 18],
    line5: [0, 3, 6, 11, 15, 19],
    // line6 / line7 镜像复用 line4 / line3
    circle1: [0, 3, 11, 19, 27, 35, 43, 50, 58, 63],
    circle2: [0, 3, 7],
    circle3: [0, 3, 11, 15],
    circle4: [0, 3, 11, 19, 23],
    circle5: [0, 3, 11, 19, 27, 31],
    circle6: [0, 3, 11, 19, 27, 35, 39],
    circle7: [0, 3, 11, 19, 27, 35, 43, 47],
    circle8: [0, 3, 11, 19, 27, 35, 43, 50, 55],
    v1: [0, 3, 6, 11, 15, 19],
    v2: [0, 3, 6, 11, 15, 19],
    v3: [0, 3, 6, 11, 15, 19],
    v4: [0, 3, 6, 11, 15, 19],
    v6: [0, 3, 6, 11, 15, 19],
    v7: [0, 3, 6, 11, 15, 19],
    v8: [0, 3, 6, 11, 15, 19],
    // pp / qq 互为镜像，共用 ppqq 模板（qq 标记 mirror: true）
    ppqq1: [0, 3, 7, 13, 17, 26, 32, 35],
    ppqq2: [0, 3, 7, 12, 16, 25, 28],
    ppqq3: [0, 3, 6, 12, 15, 22],
    ppqq4: [0, 3, 7, 12, 16, 25, 29, 35, 40, 44, 49],
    ppqq5: [0, 3, 7, 12, 16, 25, 29, 35, 40, 44, 49],
    ppqq6: [0, 3, 7, 12, 16, 25, 28, 34, 38, 41, 48],
    ppqq7: [0, 3, 7, 13, 17, 27, 31, 37, 41, 46],
    ppqq8: [0, 3, 7, 12, 16, 25, 29, 35, 41],
    // p / q 互为镜像，共用 pq 模板（q 标记 mirror: true）
    pq1: [0, 3, 8, 11, 14, 17, 21, 24, 27, 33],
    pq2: [0, 3, 8, 11, 14, 18, 21, 24, 30],
    pq3: [0, 3, 9, 12, 16, 19, 23, 27],
    pq4: [0, 3, 9, 13, 16, 20, 24],
    pq5: [0, 3, 9, 13, 17, 21],
    pq6: [0, 3, 8, 11, 15, 18, 21, 25, 28, 31, 35, 38, 42],
    pq7: [0, 3, 8, 12, 15, 18, 22, 25, 28, 32, 35, 39],
    pq8: [0, 3, 8, 11, 14, 17, 21, 24, 27, 30, 36],
    s: [0, 3, 8, 11, 17, 21, 24, 30],
    wifi: [0, 1, 4, 6, 11],
    L2: [0, 2, 7, 15, 21, 26, 32],
    L3: [0, 2, 8, 17, 20, 26, 29, 34],
    L4: [0, 2, 8, 17, 22, 26, 32],
    L5: [0, 2, 8, 16, 22, 28]
  };

  // ../adx-dl/packages/maimai-chart-engine/src/utils/slideBars.ts
  var SLIDE_BARS = {
    L2: [
      { x: 0.292, y: -0.8865, r: 2.74889 },
      { x: 0.2014, y: -0.84898, r: 2.74889 },
      { x: 0.1107, y: -0.81141, r: 2.74889 },
      { x: 0.01999, y: -0.77383, r: 2.74889 },
      { x: -0.07067, y: -0.73628, r: 2.74889 },
      { x: -0.16136, y: -0.69871, r: 2.74889 },
      { x: -0.25202, y: -0.66116, r: 2.74889 },
      { x: -0.34269, y: -0.62361, r: 2.74889 },
      { x: -0.43339, y: -0.58604, r: 2.74889 },
      { x: -0.52405, y: -0.54848, r: 2.74889 },
      { x: -0.61471, y: -0.51093, r: 2.74889 },
      { x: -0.70538, y: -0.47338, r: 2.74889 },
      { x: -0.79607, y: -0.43581, r: 2.74889 },
      { x: -0.88674, y: -0.39826, r: 2.74889 },
      { x: -0.86634, y: -0.38278, r: 0 },
      { x: -0.76813, y: -0.38278, r: 0 },
      { x: -0.67005, y: -0.38278, r: 0 },
      { x: -0.57187, y: -0.38278, r: 0 },
      { x: -0.47372, y: -0.38278, r: 0 },
      { x: -0.37554, y: -0.38278, r: 0 },
      { x: -0.27749, y: -0.38278, r: 0 },
      { x: -0.17934, y: -0.38278, r: 0 },
      { x: -0.08115, y: -0.38278, r: 0 },
      { x: 0.01695, y: -0.38278, r: 0 },
      { x: 0.1151, y: -0.38278, r: 0 },
      { x: 0.21326, y: -0.38278, r: 0 },
      { x: 0.31145, y: -0.38278, r: 0 },
      { x: 0.40959, y: -0.38278, r: 0 },
      { x: 0.5077, y: -0.38278, r: 0 },
      { x: 0.60586, y: -0.38278, r: 0 },
      { x: 0.70403, y: -0.38278, r: 0 },
      { x: 0.80216, y: -0.38278, r: 0 }
    ],
    L3: [
      { x: 0.292, y: -0.8865, r: 2.74889 },
      { x: 0.2014, y: -0.84898, r: 2.74889 },
      { x: 0.1107, y: -0.81141, r: 2.74889 },
      { x: 0.01999, y: -0.77383, r: 2.74889 },
      { x: -0.07067, y: -0.73628, r: 2.74889 },
      { x: -0.16136, y: -0.69871, r: 2.74889 },
      { x: -0.25202, y: -0.66116, r: 2.74889 },
      { x: -0.34269, y: -0.62361, r: 2.74889 },
      { x: -0.43339, y: -0.58604, r: 2.74889 },
      { x: -0.52405, y: -0.54848, r: 2.74889 },
      { x: -0.61471, y: -0.51093, r: 2.74889 },
      { x: -0.70538, y: -0.47338, r: 2.74889 },
      { x: -0.79607, y: -0.43581, r: 2.74889 },
      { x: -0.88674, y: -0.39826, r: 2.74889 },
      { x: -0.87065, y: -0.36064, r: 0.3927 },
      { x: -0.77997, y: -0.32307, r: 0.3927 },
      { x: -0.68929, y: -0.28552, r: 0.3927 },
      { x: -0.59862, y: -0.24796, r: 0.3927 },
      { x: -0.50799, y: -0.21042, r: 0.3927 },
      { x: -0.41733, y: -0.17286, r: 0.3927 },
      { x: -0.32666, y: -0.13531, r: 0.3927 },
      { x: -0.23595, y: -0.09773, r: 0.3927 },
      { x: -0.14527, y: -0.06017, r: 0.3927 },
      { x: -0.05466, y: -0.02264, r: 0.3927 },
      { x: 0.03608, y: 0.01494, r: 0.3927 },
      { x: 0.12675, y: 0.0525, r: 0.3927 },
      { x: 0.21737, y: 0.09004, r: 0.3927 },
      { x: 0.30804, y: 0.12759, r: 0.3927 },
      { x: 0.39876, y: 0.16517, r: 0.3927 },
      { x: 0.4894, y: 0.20272, r: 0.3927 },
      { x: 0.58011, y: 0.24029, r: 0.3927 },
      { x: 0.67074, y: 0.27783, r: 0.3927 },
      { x: 0.76143, y: 0.3154, r: 0.3927 },
      { x: 0.85211, y: 0.35296, r: 0.3927 }
    ],
    L4: [
      { x: 0.292, y: -0.8865, r: 2.74889 },
      { x: 0.2014, y: -0.84898, r: 2.74889 },
      { x: 0.1107, y: -0.81141, r: 2.74889 },
      { x: 0.01999, y: -0.77383, r: 2.74889 },
      { x: -0.07067, y: -0.73628, r: 2.74889 },
      { x: -0.16136, y: -0.69871, r: 2.74889 },
      { x: -0.25202, y: -0.66116, r: 2.74889 },
      { x: -0.34269, y: -0.62361, r: 2.74889 },
      { x: -0.43339, y: -0.58604, r: 2.74889 },
      { x: -0.52405, y: -0.54848, r: 2.74889 },
      { x: -0.61471, y: -0.51093, r: 2.74889 },
      { x: -0.70538, y: -0.47338, r: 2.74889 },
      { x: -0.79607, y: -0.43581, r: 2.74889 },
      { x: -0.88674, y: -0.39826, r: 2.74889 },
      { x: -0.88326, y: -0.34193, r: 0.7854 },
      { x: -0.81381, y: -0.27249, r: 0.7854 },
      { x: -0.74446, y: -0.20313, r: 0.7854 },
      { x: -0.67503, y: -0.1337, r: 0.7854 },
      { x: -0.60563, y: -0.0643, r: 0.7854 },
      { x: -0.53621, y: 512e-5, r: 0.7854 },
      { x: -0.46688, y: 0.07445, r: 0.7854 },
      { x: -0.39748, y: 0.14386, r: 0.7854 },
      { x: -0.32804, y: 0.21329, r: 0.7854 },
      { x: -0.25868, y: 0.28266, r: 0.7854 },
      { x: -0.18928, y: 0.35206, r: 0.7854 },
      { x: -0.11986, y: 0.42147, r: 0.7854 },
      { x: -0.05044, y: 0.4909, r: 0.7854 },
      { x: 0.01896, y: 0.5603, r: 0.7854 },
      { x: 0.08834, y: 0.62968, r: 0.7854 },
      { x: 0.15774, y: 0.69908, r: 0.7854 },
      { x: 0.22713, y: 0.76847, r: 0.7854 },
      { x: 0.29653, y: 0.83787, r: 0.7854 }
    ],
    L5: [
      { x: 0.292, y: -0.8865, r: 2.74889 },
      { x: 0.2014, y: -0.84898, r: 2.74889 },
      { x: 0.1107, y: -0.81141, r: 2.74889 },
      { x: 0.01999, y: -0.77383, r: 2.74889 },
      { x: -0.07067, y: -0.73628, r: 2.74889 },
      { x: -0.16136, y: -0.69871, r: 2.74889 },
      { x: -0.25202, y: -0.66116, r: 2.74889 },
      { x: -0.34269, y: -0.62361, r: 2.74889 },
      { x: -0.43339, y: -0.58604, r: 2.74889 },
      { x: -0.52405, y: -0.54848, r: 2.74889 },
      { x: -0.61471, y: -0.51093, r: 2.74889 },
      { x: -0.70538, y: -0.47338, r: 2.74889 },
      { x: -0.79607, y: -0.43581, r: 2.74889 },
      { x: -0.88674, y: -0.39826, r: 2.74889 },
      { x: -0.90201, y: -0.32944, r: 1.1781 },
      { x: -0.86444, y: -0.23874, r: 1.1781 },
      { x: -0.8269, y: -0.14811, r: 1.1781 },
      { x: -0.78932, y: -0.05737, r: 1.1781 },
      { x: -0.75176, y: 0.0333, r: 1.1781 },
      { x: -0.71419, y: 0.124, r: 1.1781 },
      { x: -0.67665, y: 0.21464, r: 1.1781 },
      { x: -0.63909, y: 0.30531, r: 1.1781 },
      { x: -0.60153, y: 0.39599, r: 1.1781 },
      { x: -0.56398, y: 0.48664, r: 1.1781 },
      { x: -0.5264, y: 0.57736, r: 1.1781 },
      { x: -0.48886, y: 0.66801, r: 1.1781 },
      { x: -0.4513, y: 0.75867, r: 1.1781 },
      { x: -0.41374, y: 0.84936, r: 1.1781 }
    ],
    circle1: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 },
      { x: 0.37787, y: 0.91891, r: 5.84727 },
      { x: 0.28665, y: 0.95082, r: 9.09177 },
      { x: 0.19252, y: 0.97159, r: 6.05867 },
      { x: 0.09569, y: 0.98646, r: 6.18272 },
      { x: -427e-5, y: 0.99243, r: 6.24423 },
      { x: -0.10051, y: 0.99053, r: 9.46923 },
      { x: -0.19538, y: 0.97607, r: 9.54903 },
      { x: -0.29038, y: 0.95029, r: 6.52563 },
      { x: -0.37963, y: 0.9194, r: 6.59967 },
      { x: -0.46734, y: 0.87465, r: 3.59472 },
      { x: -0.55054, y: 0.82664, r: 3.67709 },
      { x: -0.62815, y: 0.7691, r: 3.80042 },
      { x: -0.70059, y: 0.70349, r: 3.88938 },
      { x: -0.76579, y: 0.63084, r: 3.99761 },
      { x: -0.82519, y: 0.55116, r: 4.08192 },
      { x: -0.87362, y: 0.46941, r: 4.20673 },
      { x: -0.91667, y: 0.38, r: 4.2904 },
      { x: -0.94916, y: 0.28934, r: 4.38507 },
      { x: -0.97338, y: 0.19372, r: 4.46134 },
      { x: -0.98807, y: 0.0981, r: 4.585 },
      { x: -0.99283, y: -21e-5, r: 4.67848 },
      { x: -0.98828, y: -0.09914, r: 4.74852 },
      { x: -0.9742, y: -0.19269, r: 4.8458 },
      { x: -0.9502, y: -0.28976, r: 4.94874 },
      { x: -0.91667, y: -0.37896, r: 5.04254 },
      { x: -0.87631, y: -0.4661, r: 5.15858 },
      { x: -0.82498, y: -0.55344, r: 5.2618 },
      { x: -0.76724, y: -0.63126, r: 5.35394 },
      { x: -0.70245, y: -0.70432, r: 5.44126 },
      { x: -0.63084, y: -0.76951, r: 5.53465 },
      { x: -0.55178, y: -0.82705, r: 5.647 },
      { x: -0.46547, y: -0.87589, r: 5.73711 },
      { x: -0.38, y: -0.91812, r: 5.84727 },
      { x: -0.28727, y: -0.95082, r: 5.96344 },
      { x: -0.1931, y: -0.97358, r: 6.05867 },
      { x: -0.09624, y: -0.98704, r: 6.14907 },
      { x: 186e-5, y: -0.99387, r: 6.24423 },
      { x: 0.09872, y: -0.98911, r: 6.31308 },
      { x: 0.19517, y: -0.97462, r: 6.41471 },
      { x: 0.291, y: -0.94978, r: 6.52558 }
    ],
    circle2: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 }
    ],
    circle3: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 }
    ],
    circle4: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 }
    ],
    circle5: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 },
      { x: 0.37787, y: 0.91891, r: 5.84727 },
      { x: 0.28665, y: 0.95082, r: 9.09177 },
      { x: 0.19252, y: 0.97159, r: 6.05867 },
      { x: 0.09569, y: 0.98646, r: 6.18272 },
      { x: -427e-5, y: 0.99243, r: 6.24423 },
      { x: -0.10051, y: 0.99053, r: 9.46923 },
      { x: -0.19538, y: 0.97607, r: 9.54903 },
      { x: -0.29038, y: 0.95029, r: 6.52563 }
    ],
    circle6: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 },
      { x: 0.37787, y: 0.91891, r: 5.84727 },
      { x: 0.28665, y: 0.95082, r: 9.09177 },
      { x: 0.19252, y: 0.97159, r: 6.05867 },
      { x: 0.09569, y: 0.98646, r: 6.18272 },
      { x: -427e-5, y: 0.99243, r: 6.24423 },
      { x: -0.10051, y: 0.99053, r: 9.46923 },
      { x: -0.19538, y: 0.97607, r: 9.54903 },
      { x: -0.29038, y: 0.95029, r: 6.52563 },
      { x: -0.37963, y: 0.9194, r: 6.59967 },
      { x: -0.46734, y: 0.87465, r: 3.59472 },
      { x: -0.55054, y: 0.82664, r: 3.67709 },
      { x: -0.62815, y: 0.7691, r: 3.80042 },
      { x: -0.70059, y: 0.70349, r: 3.88938 },
      { x: -0.76579, y: 0.63084, r: 3.99761 },
      { x: -0.82519, y: 0.55116, r: 4.08192 },
      { x: -0.87362, y: 0.46941, r: 4.20673 }
    ],
    circle7: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 },
      { x: 0.37787, y: 0.91891, r: 5.84727 },
      { x: 0.28665, y: 0.95082, r: 9.09177 },
      { x: 0.19252, y: 0.97159, r: 6.05867 },
      { x: 0.09569, y: 0.98646, r: 6.18272 },
      { x: -427e-5, y: 0.99243, r: 6.24423 },
      { x: -0.10051, y: 0.99053, r: 9.46923 },
      { x: -0.19538, y: 0.97607, r: 9.54903 },
      { x: -0.29038, y: 0.95029, r: 6.52563 },
      { x: -0.37963, y: 0.9194, r: 6.59967 },
      { x: -0.46734, y: 0.87465, r: 3.59472 },
      { x: -0.55054, y: 0.82664, r: 3.67709 },
      { x: -0.62815, y: 0.7691, r: 3.80042 },
      { x: -0.70059, y: 0.70349, r: 3.88938 },
      { x: -0.76579, y: 0.63084, r: 3.99761 },
      { x: -0.82519, y: 0.55116, r: 4.08192 },
      { x: -0.87362, y: 0.46941, r: 4.20673 },
      { x: -0.91667, y: 0.38, r: 4.2904 },
      { x: -0.94916, y: 0.28934, r: 4.38507 },
      { x: -0.97338, y: 0.19372, r: 4.46134 },
      { x: -0.98807, y: 0.0981, r: 4.585 },
      { x: -0.99283, y: -21e-5, r: 4.67848 },
      { x: -0.98828, y: -0.09914, r: 4.74852 },
      { x: -0.9742, y: -0.19269, r: 4.8458 },
      { x: -0.9502, y: -0.28976, r: 4.94874 }
    ],
    circle8: [
      { x: 0.46651, y: -0.87424, r: 3.63894 },
      { x: 0.55033, y: -0.82788, r: 3.70525 },
      { x: 0.62578, y: -0.76812, r: 3.8129 },
      { x: 0.70018, y: -0.7039, r: 3.88938 },
      { x: 0.76454, y: -0.63167, r: 3.99761 },
      { x: 0.82312, y: -0.55157, r: 4.1007 },
      { x: 0.87589, y: -0.46941, r: 7.32073 },
      { x: 0.91393, y: -0.38056, r: 4.2904 },
      { x: 0.94895, y: -0.28955, r: 7.52808 },
      { x: 0.97221, y: -0.19646, r: 4.46134 },
      { x: 0.98621, y: -0.09955, r: 7.72532 },
      { x: 0.99407, y: 83e-5, r: 4.67848 },
      { x: 0.98845, y: 0.09741, r: 4.74852 },
      { x: 0.97296, y: 0.19182, r: 8.01223 },
      { x: 0.9507, y: 0.2881, r: 4.94874 },
      { x: 0.91733, y: 0.37813, r: 1.91766 },
      { x: 0.87507, y: 0.46754, r: 5.15858 },
      { x: 0.82353, y: 0.55199, r: 8.39868 },
      { x: 0.76461, y: 0.63013, r: 5.35394 },
      { x: 0.70161, y: 0.70413, r: 5.44276 },
      { x: 0.62888, y: 0.76786, r: 8.68718 },
      { x: 0.55033, y: 0.82754, r: 5.647 },
      { x: 0.467, y: 0.87508, r: 5.73711 },
      { x: 0.37787, y: 0.91891, r: 5.84727 },
      { x: 0.28665, y: 0.95082, r: 9.09177 },
      { x: 0.19252, y: 0.97159, r: 6.05867 },
      { x: 0.09569, y: 0.98646, r: 6.18272 },
      { x: -427e-5, y: 0.99243, r: 6.24423 },
      { x: -0.10051, y: 0.99053, r: 9.46923 },
      { x: -0.19538, y: 0.97607, r: 9.54903 },
      { x: -0.29038, y: 0.95029, r: 6.52563 },
      { x: -0.37963, y: 0.9194, r: 6.59967 },
      { x: -0.46734, y: 0.87465, r: 3.59472 },
      { x: -0.55054, y: 0.82664, r: 3.67709 },
      { x: -0.62815, y: 0.7691, r: 3.80042 },
      { x: -0.70059, y: 0.70349, r: 3.88938 },
      { x: -0.76579, y: 0.63084, r: 3.99761 },
      { x: -0.82519, y: 0.55116, r: 4.08192 },
      { x: -0.87362, y: 0.46941, r: 4.20673 },
      { x: -0.91667, y: 0.38, r: 4.2904 },
      { x: -0.94916, y: 0.28934, r: 4.38507 },
      { x: -0.97338, y: 0.19372, r: 4.46134 },
      { x: -0.98807, y: 0.0981, r: 4.585 },
      { x: -0.99283, y: -21e-5, r: 4.67848 },
      { x: -0.98828, y: -0.09914, r: 4.74852 },
      { x: -0.9742, y: -0.19269, r: 4.8458 },
      { x: -0.9502, y: -0.28976, r: 4.94874 },
      { x: -0.91667, y: -0.37896, r: 5.04254 },
      { x: -0.87631, y: -0.4661, r: 5.15858 },
      { x: -0.82498, y: -0.55344, r: 5.2618 },
      { x: -0.76724, y: -0.63126, r: 5.35394 },
      { x: -0.70245, y: -0.70432, r: 5.44126 },
      { x: -0.63084, y: -0.76951, r: 5.53465 },
      { x: -0.55178, y: -0.82705, r: 5.647 },
      { x: -0.46547, y: -0.87589, r: 5.73711 }
    ],
    line3: [
      { x: 0.42038, y: -0.83332, r: 1.17809 },
      { x: 0.45791, y: -0.74273, r: 1.17809 },
      { x: 0.49548, y: -0.65203, r: 1.17809 },
      { x: 0.53305, y: -0.56132, r: 1.17809 },
      { x: 0.57061, y: -0.47066, r: 1.17809 },
      { x: 0.60817, y: -0.37997, r: 1.17809 },
      { x: 0.64573, y: -0.28931, r: 1.17809 },
      { x: 0.68328, y: -0.19864, r: 1.17809 },
      { x: 0.72085, y: -0.10794, r: 1.17809 },
      { x: 0.75841, y: -0.01728, r: 1.17809 },
      { x: 0.79596, y: 0.07338, r: 1.17809 },
      { x: 0.83352, y: 0.16405, r: 1.17809 },
      { x: 0.87108, y: 0.25473, r: 1.17809 }
    ],
    line4: [
      { x: 0.38278, y: -0.82589, r: 1.5708 },
      { x: 0.38278, y: -0.72777, r: 1.5708 },
      { x: 0.38278, y: -0.62961, r: 1.5708 },
      { x: 0.38278, y: -0.53138, r: 1.5708 },
      { x: 0.38278, y: -0.43324, r: 1.5708 },
      { x: 0.38278, y: -0.33515, r: 1.5708 },
      { x: 0.38278, y: -0.23694, r: 1.5708 },
      { x: 0.38278, y: -0.13881, r: 1.5708 },
      { x: 0.38278, y: -0.04066, r: 1.5708 },
      { x: 0.38278, y: 0.0574, r: 1.5708 },
      { x: 0.38278, y: 0.15558, r: 1.5708 },
      { x: 0.38278, y: 0.25373, r: 1.5708 },
      { x: 0.38278, y: 0.35187, r: 1.5708 },
      { x: 0.38278, y: 0.45005, r: 1.5708 },
      { x: 0.38278, y: 0.54818, r: 1.5708 },
      { x: 0.38278, y: 0.64634, r: 1.5708 },
      { x: 0.38278, y: 0.74445, r: 1.5708 },
      { x: 0.38278, y: 0.84261, r: 1.5708 }
    ],
    line5: [
      { x: 0.34521, y: -0.83341, r: 1.9635 },
      { x: 0.30765, y: -0.74273, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.2325, y: -0.56131, r: 1.9635 },
      { x: 0.19494, y: -0.47063, r: 1.9635 },
      { x: 0.15739, y: -0.37996, r: 1.9635 },
      { x: 0.11985, y: -0.28934, r: 1.9635 },
      { x: 0.08228, y: -0.19865, r: 1.9635 },
      { x: 0.04473, y: -0.10799, r: 1.9635 },
      { x: 715e-5, y: -0.01727, r: 1.9635 },
      { x: -0.03042, y: 0.07343, r: 1.9635 },
      { x: -0.06798, y: 0.16412, r: 1.9635 },
      { x: -0.10552, y: 0.25476, r: 1.9635 },
      { x: -0.14307, y: 0.34541, r: 1.9635 },
      { x: -0.18064, y: 0.4361, r: 1.9635 },
      { x: -0.21819, y: 0.52676, r: 1.9635 },
      { x: -0.25576, y: 0.61745, r: 1.9635 },
      { x: -0.29332, y: 0.70814, r: 1.9635 },
      { x: -0.33088, y: 0.79881, r: 1.9635 }
    ],
    ppqq1: [
      { x: 0.34101, y: -0.83522, r: 2.01008 },
      { x: 0.29928, y: -0.74641, r: 2.01008 },
      { x: 0.25754, y: -0.65759, r: 2.01008 },
      { x: 0.21579, y: -0.56874, r: 2.01008 },
      { x: 0.17406, y: -0.47994, r: 2.01008 },
      { x: 0.13231, y: -0.3911, r: 2.01008 },
      { x: 0.09058, y: -0.30228, r: 2.01008 },
      { x: 0.04884, y: -0.21345, r: 1.98181 },
      { x: 0.01223, y: -0.12253, r: 1.86501 },
      { x: -506e-5, y: -0.0261, r: 1.70163 },
      { x: -187e-5, y: 0.07183, r: 1.51447 },
      { x: 0.02175, y: 0.16691, r: 1.3146 },
      { x: 0.0649, y: 0.25487, r: 1.10908 },
      { x: 0.12551, y: 0.33181, r: 0.90125 },
      { x: 0.20087, y: 0.39444, r: 0.69183 },
      { x: 0.28766, y: 0.43989, r: 0.48088 },
      { x: 0.38206, y: 0.46601, r: 0.26973 },
      { x: 0.47988, y: 0.47175, r: 0.05938 },
      { x: 0.57673, y: 0.45701, r: -0.15201 },
      { x: 0.66829, y: 0.42219, r: -0.36368 },
      { x: 0.75049, y: 0.36888, r: -0.5747 },
      { x: 0.81973, y: 0.29959, r: -0.78541 },
      { x: 0.87299, y: 0.21735, r: -0.99674 },
      { x: 0.90775, y: 0.12576, r: -1.20861 },
      { x: 0.92242, y: 0.02891, r: -1.41933 },
      { x: 0.91662, y: -0.06888, r: -1.6304 },
      { x: 0.89043, y: -0.16328, r: -1.86625 },
      { x: 0.84087, y: -0.24762, r: -2.01614 },
      { x: 0.78583, y: -0.32889, r: -2.09108 },
      { x: 0.73082, y: -0.41013, r: -2.12856 },
      { x: 0.67576, y: -0.49144, r: -2.14729 },
      { x: 0.62076, y: -0.57266, r: -2.15666 },
      { x: 0.56571, y: -0.65395, r: -2.16134 },
      { x: 0.51069, y: -0.7352, r: -2.16369 },
      { x: 0.45566, y: -0.81648, r: -2.16486 }
    ],
    ppqq2: [
      { x: 0.34108, y: -0.83524, r: 2.00954 },
      { x: 0.29937, y: -0.74635, r: 2.00954 },
      { x: 0.25768, y: -0.65752, r: 2.00954 },
      { x: 0.216, y: -0.56868, r: 2.00954 },
      { x: 0.1743, y: -0.47982, r: 2.00954 },
      { x: 0.13261, y: -0.39098, r: 2.00954 },
      { x: 0.09092, y: -0.30212, r: 2.00954 },
      { x: 0.04922, y: -0.21327, r: 1.98365 },
      { x: 0.01224, y: -0.12252, r: 1.86596 },
      { x: -506e-5, y: -0.02609, r: 1.70211 },
      { x: -187e-5, y: 0.07183, r: 1.51471 },
      { x: 0.02175, y: 0.16691, r: 1.31472 },
      { x: 0.0649, y: 0.25487, r: 1.10913 },
      { x: 0.12553, y: 0.33183, r: 0.90126 },
      { x: 0.20087, y: 0.39444, r: 0.69184 },
      { x: 0.28766, y: 0.43989, r: 0.48087 },
      { x: 0.38208, y: 0.46601, r: 0.26971 },
      { x: 0.47988, y: 0.47175, r: 0.05937 },
      { x: 0.57673, y: 0.45701, r: -0.15202 },
      { x: 0.66829, y: 0.42219, r: -0.36368 },
      { x: 0.7505, y: 0.36888, r: -0.57471 },
      { x: 0.81975, y: 0.29958, r: -0.78543 },
      { x: 0.87299, y: 0.21735, r: -0.99675 },
      { x: 0.90776, y: 0.12576, r: -1.20863 },
      { x: 0.92243, y: 0.02889, r: -1.38608 },
      { x: 0.92314, y: -0.06926, r: -1.47689 },
      { x: 0.92344, y: -0.1674, r: -1.5223 },
      { x: 0.92374, y: -0.26555, r: -1.54501 }
    ],
    ppqq3: [
      { x: 0.34058, y: -0.83547, r: 2.01456 },
      { x: 0.29849, y: -0.74681, r: 2.01374 },
      { x: 0.25649, y: -0.65809, r: 2.01272 },
      { x: 0.21461, y: -0.56934, r: 2.01145 },
      { x: 0.17286, y: -0.4805, r: 2.0098 },
      { x: 0.13129, y: -0.3916, r: 2.00747 },
      { x: 0.08998, y: -0.30254, r: 2.00356 },
      { x: 0.04918, y: -0.2133, r: 1.98126 },
      { x: 0.01206, y: -0.12252, r: 1.87093 },
      { x: -643e-5, y: -0.02632, r: 1.70485 },
      { x: -329e-5, y: 0.07158, r: 1.51333 },
      { x: 0.02085, y: 0.16652, r: 1.31181 },
      { x: 0.06439, y: 0.25429, r: 1.10664 },
      { x: 0.12518, y: 0.33112, r: 0.89955 },
      { x: 0.20058, y: 0.39367, r: 0.69144 },
      { x: 0.28732, y: 0.43919, r: 0.49444 },
      { x: 0.381, y: 0.46791, r: 0.25748 },
      { x: 0.47866, y: 0.46991, r: 0.04979 },
      { x: 0.57558, y: 0.45448, r: -0.069 },
      { x: 0.672, y: 0.43616, r: -0.13525 },
      { x: 0.76817, y: 0.41652, r: -0.17288 },
      { x: 0.86414, y: 0.39601, r: -0.19502 }
    ],
    ppqq4: [
      { x: 0.34116, y: -0.83515, r: 2.00837 },
      { x: 0.29959, y: -0.74629, r: 2.00837 },
      { x: 0.258, y: -0.65738, r: 2.00837 },
      { x: 0.2164, y: -0.56847, r: 2.00837 },
      { x: 0.17481, y: -0.47956, r: 2.00837 },
      { x: 0.13323, y: -0.39068, r: 2.00837 },
      { x: 0.09164, y: -0.30178, r: 2.00837 },
      { x: 0.05005, y: -0.21288, r: 1.98269 },
      { x: 0.01313, y: -0.12209, r: 1.86589 },
      { x: -424e-5, y: -0.02568, r: 1.70117 },
      { x: -88e-5, y: 0.07222, r: 1.5131 },
      { x: 0.02296, y: 0.16725, r: 1.31398 },
      { x: 0.06609, y: 0.25521, r: 1.10903 },
      { x: 0.12668, y: 0.3322, r: 0.90037 },
      { x: 0.20213, y: 0.39469, r: 0.69015 },
      { x: 0.28903, y: 0.43992, r: 0.48037 },
      { x: 0.38344, y: 0.46611, r: 0.26938 },
      { x: 0.48123, y: 0.47183, r: 0.05782 },
      { x: 0.57805, y: 0.45683, r: -0.15325 },
      { x: 0.6696, y: 0.42191, r: -0.36392 },
      { x: 0.75182, y: 0.36867, r: -0.57511 },
      { x: 0.82104, y: 0.29933, r: -0.78699 },
      { x: 0.87406, y: 0.21696, r: -0.99786 },
      { x: 0.90876, y: 0.12535, r: -1.20873 },
      { x: 0.92352, y: 0.0285, r: -1.42046 },
      { x: 0.91751, y: -0.06928, r: -1.63193 },
      { x: 0.89113, y: -0.16364, r: -1.84273 },
      { x: 0.84565, y: -0.2504, r: -2.05362 },
      { x: 0.78301, y: -0.32574, r: -2.26532 },
      { x: 0.70589, y: -0.38616, r: -2.47686 },
      { x: 0.61781, y: -0.42905, r: -2.68738 },
      { x: 0.52275, y: -0.45269, r: -2.89885 },
      { x: 0.42482, y: -0.45575, r: -3.11056 },
      { x: 0.32845, y: -0.43815, r: 2.96156 },
      { x: 0.23787, y: -0.4008, r: 2.75083 },
      { x: 0.1571, y: -0.34536, r: 2.53951 },
      { x: 0.0898, y: -0.27419, r: 2.32764 },
      { x: 0.03902, y: -0.19041, r: 2.11693 },
      { x: 676e-5, y: -0.09789, r: 1.90591 },
      { x: -536e-5, y: -68e-5, r: 1.69414 },
      { x: 329e-5, y: 0.0969, r: 1.48143 },
      { x: 0.03244, y: 0.19044, r: 1.30337 },
      { x: 0.07472, y: 0.27898, r: 1.21434 },
      { x: 0.11703, y: 0.36758, r: 1.16982 },
      { x: 0.15932, y: 0.45615, r: 1.14756 },
      { x: 0.20159, y: 0.54468, r: 1.13644 },
      { x: 0.2439, y: 0.63328, r: 1.13087 },
      { x: 0.28619, y: 0.72184, r: 1.12809 },
      { x: 0.32848, y: 0.81041, r: 1.1267 }
    ],
    ppqq5: [
      { x: 0.33939, y: -0.83605, r: 2.02747 },
      { x: 0.2962, y: -0.7479, r: 2.02581 },
      { x: 0.25322, y: -0.65968, r: 2.02374 },
      { x: 0.21044, y: -0.57132, r: 2.02118 },
      { x: 0.16796, y: -0.48286, r: 2.01785 },
      { x: 0.12581, y: -0.3942, r: 2.01314 },
      { x: 0.08422, y: -0.30531, r: 2.00532 },
      { x: 0.0436, y: -0.21597, r: 1.97692 },
      { x: 743e-5, y: -0.1248, r: 1.86455 },
      { x: -0.01024, y: -0.02847, r: 1.69865 },
      { x: -651e-5, y: 0.06943, r: 1.50837 },
      { x: 0.01798, y: 0.16429, r: 1.30866 },
      { x: 0.06163, y: 0.25199, r: 1.10568 },
      { x: 0.12233, y: 0.3289, r: 0.90107 },
      { x: 0.19749, y: 0.39176, r: 0.69545 },
      { x: 0.28394, y: 0.43785, r: 0.48883 },
      { x: 0.37805, y: 0.46513, r: 0.27948 },
      { x: 0.47575, y: 0.472, r: 0.06871 },
      { x: 0.57273, y: 0.45813, r: -0.142 },
      { x: 0.66469, y: 0.42428, r: -0.35248 },
      { x: 0.74753, y: 0.372, r: -0.56352 },
      { x: 0.81755, y: 0.30348, r: -0.77534 },
      { x: 0.87153, y: 0.22173, r: -0.98626 },
      { x: 0.90729, y: 0.13052, r: -1.19706 },
      { x: 0.92318, y: 0.03385, r: -1.40878 },
      { x: 0.91832, y: -0.064, r: -1.62029 },
      { x: 0.89304, y: -0.15865, r: -1.83111 },
      { x: 0.84857, y: -0.24594, r: -2.04196 },
      { x: 0.78681, y: -0.322, r: -2.25362 },
      { x: 0.71041, y: -0.38331, r: -2.46522 },
      { x: 0.62283, y: -0.42723, r: -2.67546 },
      { x: 0.52805, y: -0.45203, r: -2.88571 },
      { x: 0.43019, y: -0.4565, r: -3.0957 },
      { x: 0.33354, y: -0.44049, r: 2.97772 },
      { x: 0.24232, y: -0.40473, r: 2.76686 },
      { x: 0.16068, y: -0.35059, r: 2.55323 },
      { x: 0.09259, y: -0.28019, r: 2.3367 },
      { x: 0.04143, y: -0.19664, r: 2.1454 },
      { x: 473e-5, y: -0.10562, r: 2.04191 },
      { x: -0.03055, y: -0.01402, r: 1.98853 },
      { x: -0.06553, y: 0.07769, r: 1.96084 },
      { x: -0.10032, y: 0.16947, r: 1.94629 },
      { x: -0.13497, y: 0.26126, r: 1.93849 },
      { x: -0.16954, y: 0.35314, r: 1.93416 },
      { x: -0.20402, y: 0.44501, r: 1.93164 },
      { x: -0.23846, y: 0.53697, r: 1.93008 },
      { x: -0.27281, y: 0.62887, r: 1.92902 },
      { x: -0.30713, y: 0.72084, r: 1.92822 },
      { x: -0.3414, y: 0.81282, r: 1.92754 }
    ],
    ppqq6: [
      { x: 0.3403, y: -0.83561, r: 2.01743 },
      { x: 0.29799, y: -0.74705, r: 2.01621 },
      { x: 0.2558, y: -0.65841, r: 2.01468 },
      { x: 0.21379, y: -0.56971, r: 2.01279 },
      { x: 0.17198, y: -0.48093, r: 2.01032 },
      { x: 0.13042, y: -0.39198, r: 2.00683 },
      { x: 0.08928, y: -0.30288, r: 2.00099 },
      { x: 0.04888, y: -0.21345, r: 1.97533 },
      { x: 0.0126, y: -0.12233, r: 1.86509 },
      { x: -533e-5, y: -0.02603, r: 1.70136 },
      { x: -208e-5, y: 0.07189, r: 1.5124 },
      { x: 0.02191, y: 0.16686, r: 1.31253 },
      { x: 0.06524, y: 0.25473, r: 1.10772 },
      { x: 0.12592, y: 0.33165, r: 0.9 },
      { x: 0.20133, y: 0.39418, r: 0.69088 },
      { x: 0.28816, y: 0.43958, r: 0.48175 },
      { x: 0.38251, y: 0.46596, r: 0.2711 },
      { x: 0.48028, y: 0.47187, r: 0.0597 },
      { x: 0.57712, y: 0.45707, r: -0.15128 },
      { x: 0.66874, y: 0.42235, r: -0.36192 },
      { x: 0.75109, y: 0.36927, r: -0.57308 },
      { x: 0.82044, y: 0.30008, r: -0.78495 },
      { x: 0.87364, y: 0.21781, r: -0.99584 },
      { x: 0.90852, y: 0.12626, r: -1.20669 },
      { x: 0.92347, y: 0.02945, r: -1.41842 },
      { x: 0.91766, y: -0.06835, r: -1.62989 },
      { x: 0.89148, y: -0.16275, r: -1.8407 },
      { x: 0.84617, y: -0.24962, r: -2.05158 },
      { x: 0.78369, y: -0.32507, r: -2.26327 },
      { x: 0.7067, y: -0.38565, r: -2.47481 },
      { x: 0.61871, y: -0.42872, r: -2.68533 },
      { x: 0.52368, y: -0.45256, r: -2.89679 },
      { x: 0.42578, y: -0.45582, r: -3.10851 },
      { x: 0.32936, y: -0.43841, r: 2.96361 },
      { x: 0.23872, y: -0.40126, r: 2.76333 },
      { x: 0.15657, y: -0.34761, r: 2.65529 },
      { x: 0.07527, y: -0.29265, r: 2.60127 },
      { x: -611e-5, y: -0.23765, r: 2.57426 },
      { x: -0.08738, y: -0.18273, r: 2.56076 },
      { x: -0.16873, y: -0.12775, r: 2.55401 },
      { x: -0.25001, y: -0.07281, r: 2.55063 },
      { x: -0.33135, y: -0.01784, r: 2.54894 },
      { x: -0.4127, y: 0.03714, r: 2.5481 },
      { x: -0.49398, y: 0.09208, r: 2.54768 },
      { x: -0.57531, y: 0.14704, r: 2.54747 },
      { x: -0.65664, y: 0.20201, r: 2.54736 },
      { x: -0.73792, y: 0.25695, r: 2.54731 },
      { x: -0.81926, y: 0.31192, r: 2.54728 }
    ],
    ppqq7: [
      { x: 0.34058, y: -0.83547, r: 2.01456 },
      { x: 0.29849, y: -0.74681, r: 2.01374 },
      { x: 0.25649, y: -0.65809, r: 2.01272 },
      { x: 0.21461, y: -0.56934, r: 2.01145 },
      { x: 0.17286, y: -0.4805, r: 2.0098 },
      { x: 0.13129, y: -0.3916, r: 2.00747 },
      { x: 0.08998, y: -0.30254, r: 2.00356 },
      { x: 0.04918, y: -0.2133, r: 1.98126 },
      { x: 0.01206, y: -0.12252, r: 1.87093 },
      { x: -643e-5, y: -0.02632, r: 1.70485 },
      { x: -329e-5, y: 0.07158, r: 1.51333 },
      { x: 0.02085, y: 0.16652, r: 1.31181 },
      { x: 0.06439, y: 0.25429, r: 1.10664 },
      { x: 0.12518, y: 0.33112, r: 0.89955 },
      { x: 0.20058, y: 0.39367, r: 0.69134 },
      { x: 0.28734, y: 0.43918, r: 0.48278 },
      { x: 0.38165, y: 0.46571, r: 0.27242 },
      { x: 0.47942, y: 0.47179, r: 0.06116 },
      { x: 0.57628, y: 0.45714, r: -0.14975 },
      { x: 0.66794, y: 0.42257, r: -0.36034 },
      { x: 0.75039, y: 0.36961, r: -0.57149 },
      { x: 0.81985, y: 0.30053, r: -0.78334 },
      { x: 0.87317, y: 0.21836, r: -0.99423 },
      { x: 0.90821, y: 0.12686, r: -1.20507 },
      { x: 0.92332, y: 0.03008, r: -1.4168 },
      { x: 0.91766, y: -0.06774, r: -1.62828 },
      { x: 0.89163, y: -0.16218, r: -1.83909 },
      { x: 0.84648, y: -0.24911, r: -2.04996 },
      { x: 0.78411, y: -0.32467, r: -2.26164 },
      { x: 0.70721, y: -0.38537, r: -2.47321 },
      { x: 0.6193, y: -0.42858, r: -2.68458 },
      { x: 0.52427, y: -0.4524, r: -2.89892 },
      { x: 0.42632, y: -0.45518, r: -3.04704 },
      { x: 0.32834, y: -0.44993, r: -3.1211 },
      { x: 0.23027, y: -0.44467, r: 3.12506 },
      { x: 0.13227, y: -0.43941, r: 3.10654 },
      { x: 0.03431, y: -0.43416, r: 3.09729 },
      { x: -0.06369, y: -0.42891, r: 3.09266 },
      { x: -0.16168, y: -0.42365, r: 3.09034 },
      { x: -0.25973, y: -0.4184, r: 3.08919 },
      { x: -0.3577, y: -0.41314, r: 3.08861 },
      { x: -0.45576, y: -0.40789, r: 3.08832 },
      { x: -0.55375, y: -0.40263, r: 3.08817 },
      { x: -0.65172, y: -0.39738, r: 3.0881 },
      { x: -0.74974, y: -0.39213, r: 3.08807 },
      { x: -0.84774, y: -0.38687, r: 3.08805 }
    ],
    ppqq8: [
      { x: 0.34058, y: -0.83547, r: 2.01456 },
      { x: 0.29849, y: -0.74681, r: 2.01374 },
      { x: 0.25649, y: -0.65809, r: 2.01272 },
      { x: 0.21461, y: -0.56934, r: 2.01145 },
      { x: 0.17286, y: -0.4805, r: 2.0098 },
      { x: 0.13129, y: -0.3916, r: 2.00747 },
      { x: 0.08998, y: -0.30254, r: 2.00356 },
      { x: 0.04918, y: -0.2133, r: 1.98126 },
      { x: 0.01206, y: -0.12252, r: 1.87093 },
      { x: -643e-5, y: -0.02632, r: 1.70485 },
      { x: -329e-5, y: 0.07158, r: 1.51333 },
      { x: 0.02085, y: 0.16652, r: 1.31181 },
      { x: 0.06439, y: 0.25429, r: 1.10664 },
      { x: 0.12518, y: 0.33112, r: 0.89955 },
      { x: 0.20058, y: 0.39367, r: 0.69134 },
      { x: 0.28734, y: 0.43918, r: 0.48278 },
      { x: 0.38165, y: 0.46571, r: 0.27242 },
      { x: 0.47942, y: 0.47179, r: 0.06116 },
      { x: 0.57628, y: 0.45714, r: -0.14975 },
      { x: 0.66794, y: 0.42257, r: -0.36034 },
      { x: 0.75039, y: 0.36961, r: -0.57149 },
      { x: 0.81985, y: 0.30053, r: -0.78334 },
      { x: 0.87317, y: 0.21836, r: -0.9945 },
      { x: 0.90816, y: 0.12685, r: -1.20858 },
      { x: 0.92261, y: 0.02998, r: -1.42722 },
      { x: 0.91527, y: -0.0677, r: -1.6458 },
      { x: 0.88692, y: -0.16146, r: -1.85907 },
      { x: 0.83981, y: -0.24738, r: -2.06405 },
      { x: 0.77681, y: -0.32244, r: -2.26021 },
      { x: 0.70091, y: -0.38448, r: -2.44571 },
      { x: 0.61535, y: -0.43238, r: -2.56408 },
      { x: 0.52736, y: -0.47588, r: -2.62359 },
      { x: 0.43934, y: -0.51932, r: -2.65352 },
      { x: 0.35132, y: -0.56273, r: -2.66861 },
      { x: 0.26328, y: -0.60612, r: -2.67624 },
      { x: 0.17523, y: -0.6495, r: -2.68012 },
      { x: 0.08717, y: -0.69286, r: -2.68212 },
      { x: -89e-5, y: -0.73621, r: -2.68317 },
      { x: -0.08893, y: -0.77954, r: -2.68374 },
      { x: -0.177, y: -0.82288, r: -2.68406 },
      { x: -0.26505, y: -0.8662, r: -2.68426 }
    ],
    pq1: [
      { x: 0.31336, y: -0.85469, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17455, y: -0.71588, r: 2.35619 },
      { x: 0.10514, y: -0.64646, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43827, r: 2.35619 },
      { x: -0.17245, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.33454 },
      { x: -0.30811, y: -0.22722, r: 2.20653 },
      { x: -0.35569, y: -0.14169, r: 2.0137 },
      { x: -0.37991, y: -0.04685, r: 1.7895 },
      { x: -0.37938, y: 0.05103, r: 1.54961 },
      { x: -0.35411, y: 0.14559, r: 1.30081 },
      { x: -0.30558, y: 0.23059, r: 1.04843 },
      { x: -0.23711, y: 0.30054, r: 0.79444 },
      { x: -0.15318, y: 0.3509, r: 0.53854 },
      { x: -0.05918, y: 0.3782, r: 0.2827 },
      { x: 0.03867, y: 0.38083, r: 0.02707 },
      { x: 0.13401, y: 0.35865, r: -0.2295 },
      { x: 0.22055, y: 0.31293, r: -0.48601 },
      { x: 0.29266, y: 0.24675, r: -0.74184 },
      { x: 0.34574, y: 0.1645, r: -0.9987 },
      { x: 0.37609, y: 0.07145, r: -1.25059 },
      { x: 0.38278, y: -0.02631, r: -1.41069 },
      { x: 0.38278, y: -0.12449, r: -1.49074 },
      { x: 0.38278, y: -0.22259, r: -1.53077 },
      { x: 0.38278, y: -0.32076, r: -1.55078 },
      { x: 0.38278, y: -0.41888, r: -1.56079 },
      { x: 0.38278, y: -0.51706, r: -1.56579 },
      { x: 0.38278, y: -0.61522, r: -1.56829 },
      { x: 0.38278, y: -0.71336, r: -1.56955 },
      { x: 0.38278, y: -0.81149, r: -1.57017 }
    ],
    pq2: [
      { x: 0.31336, y: -0.85469, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17455, y: -0.71588, r: 2.35619 },
      { x: 0.10514, y: -0.64646, r: 2.35619 },
      { x: 0.03576, y: -0.57709, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43827, r: 2.35619 },
      { x: -0.17246, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.33454 },
      { x: -0.30811, y: -0.22722, r: 2.20653 },
      { x: -0.35569, y: -0.14169, r: 2.0137 },
      { x: -0.37992, y: -0.04685, r: 1.7895 },
      { x: -0.37938, y: 0.05104, r: 1.54961 },
      { x: -0.35412, y: 0.14559, r: 1.30081 },
      { x: -0.30559, y: 0.23059, r: 1.04843 },
      { x: -0.23711, y: 0.30054, r: 0.79444 },
      { x: -0.15318, y: 0.3509, r: 0.53854 },
      { x: -0.05918, y: 0.3782, r: 0.2827 },
      { x: 0.03867, y: 0.38083, r: 0.02707 },
      { x: 0.134, y: 0.35865, r: -0.2295 },
      { x: 0.22054, y: 0.31293, r: -0.47911 },
      { x: 0.29366, y: 0.24767, r: -0.63225 },
      { x: 0.36308, y: 0.17825, r: -0.70883 },
      { x: 0.43248, y: 0.10885, r: -0.74711 },
      { x: 0.50187, y: 0.03945, r: -0.76625 },
      { x: 0.57128, y: -0.02995, r: -0.77583 },
      { x: 0.64066, y: -0.09933, r: -0.78061 },
      { x: 0.71007, y: -0.16874, r: -0.78301 },
      { x: 0.77946, y: -0.23813, r: -0.7842 },
      { x: 0.84887, y: -0.30754, r: -0.7848 }
    ],
    pq3: [
      { x: 0.31335, y: -0.85468, r: 2.35619 },
      { x: 0.24393, y: -0.78525, r: 2.35619 },
      { x: 0.17453, y: -0.71586, r: 2.35619 },
      { x: 0.10513, y: -0.64645, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43828, r: 2.35619 },
      { x: -0.17245, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29947, r: 2.33486 },
      { x: -0.30816, y: -0.22726, r: 2.20905 },
      { x: -0.35614, y: -0.14196, r: 2.01419 },
      { x: -0.38022, y: -0.0471, r: 1.78588 },
      { x: -0.37892, y: 0.05077, r: 1.54533 },
      { x: -0.35318, y: 0.14523, r: 1.30088 },
      { x: -0.30503, y: 0.23045, r: 1.05234 },
      { x: -0.23709, y: 0.30094, r: 0.79725 },
      { x: -0.15326, y: 0.35143, r: 0.53772 },
      { x: -0.05917, y: 0.3783, r: 0.29168 },
      { x: 0.03876, y: 0.38278, r: 0.14584 },
      { x: 0.13696, y: 0.38278, r: 0.07292 },
      { x: 0.23508, y: 0.38278, r: 0.03646 },
      { x: 0.33326, y: 0.38278, r: 0.01823 },
      { x: 0.43139, y: 0.38278, r: 912e-5 },
      { x: 0.52952, y: 0.38278, r: 456e-5 },
      { x: 0.62767, y: 0.38278, r: 228e-5 },
      { x: 0.72581, y: 0.38278, r: 114e-5 },
      { x: 0.82396, y: 0.38278, r: 57e-5 }
    ],
    pq4: [
      { x: 0.31335, y: -0.85468, r: 2.3562 },
      { x: 0.24396, y: -0.78529, r: 2.3562 },
      { x: 0.17454, y: -0.71587, r: 2.3562 },
      { x: 0.10514, y: -0.64647, r: 2.3562 },
      { x: 0.03576, y: -0.57709, r: 2.3562 },
      { x: -0.03364, y: -0.50769, r: 2.3562 },
      { x: -0.10305, y: -0.43828, r: 2.3562 },
      { x: -0.17246, y: -0.36887, r: 2.3562 },
      { x: -0.24185, y: -0.29948, r: 2.33415 },
      { x: -0.30805, y: -0.22717, r: 2.20581 },
      { x: -0.35554, y: -0.14159, r: 2.01301 },
      { x: -0.3797, y: -0.04674, r: 1.78902 },
      { x: -0.37914, y: 0.05114, r: 1.5494 },
      { x: -0.35388, y: 0.14572, r: 1.30092 },
      { x: -0.30539, y: 0.23073, r: 1.06194 },
      { x: -0.23871, y: 0.30262, r: 0.92368 },
      { x: -0.16931, y: 0.37202, r: 0.85454 },
      { x: -0.09989, y: 0.44144, r: 0.81998 },
      { x: -0.03048, y: 0.51085, r: 0.80269 },
      { x: 0.03891, y: 0.58025, r: 0.79405 },
      { x: 0.10832, y: 0.64965, r: 0.78973 },
      { x: 0.17771, y: 0.71905, r: 0.78757 },
      { x: 0.24711, y: 0.78845, r: 0.78649 },
      { x: 0.31651, y: 0.85786, r: 0.78595 }
    ],
    pq5: [
      { x: 0.31332, y: -0.85465, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17453, y: -0.71586, r: 2.35619 },
      { x: 0.10513, y: -0.64646, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10306, y: -0.43827, r: 2.35619 },
      { x: -0.17246, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.32501 },
      { x: -0.30669, y: -0.22601, r: 2.19598 },
      { x: -0.3533, y: -0.13989, r: 2.0137 },
      { x: -0.37854, y: -0.04528, r: 1.81387 },
      { x: -0.38278, y: 0.05272, r: 1.69233 },
      { x: -0.38278, y: 0.15085, r: 1.63157 },
      { x: -0.38278, y: 0.249, r: 1.60118 },
      { x: -0.38278, y: 0.34713, r: 1.58599 },
      { x: -0.38278, y: 0.44531, r: 1.57839 },
      { x: -0.38278, y: 0.54344, r: 1.57459 },
      { x: -0.38278, y: 0.6416, r: 1.5727 },
      { x: -0.38278, y: 0.73974, r: 1.57175 },
      { x: -0.38278, y: 0.83789, r: 1.57127 }
    ],
    pq6: [
      { x: 0.31336, y: -0.85469, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17455, y: -0.71588, r: 2.35619 },
      { x: 0.10514, y: -0.64646, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43827, r: 2.35619 },
      { x: -0.17245, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.33454 },
      { x: -0.30811, y: -0.22722, r: 2.20653 },
      { x: -0.35569, y: -0.14169, r: 2.0137 },
      { x: -0.37991, y: -0.04685, r: 1.7895 },
      { x: -0.37938, y: 0.05104, r: 1.54961 },
      { x: -0.35411, y: 0.14559, r: 1.30081 },
      { x: -0.30558, y: 0.23059, r: 1.04843 },
      { x: -0.23711, y: 0.30054, r: 0.79444 },
      { x: -0.15318, y: 0.3509, r: 0.53854 },
      { x: -0.05918, y: 0.3782, r: 0.2827 },
      { x: 0.03867, y: 0.38083, r: 0.02707 },
      { x: 0.13401, y: 0.35865, r: -0.2295 },
      { x: 0.22055, y: 0.31293, r: -0.48601 },
      { x: 0.29266, y: 0.24675, r: -0.74184 },
      { x: 0.34574, y: 0.16451, r: -0.9987 },
      { x: 0.37609, y: 0.07145, r: -1.25514 },
      { x: 0.38188, y: -0.02626, r: -1.511 },
      { x: 0.36281, y: -0.12227, r: -1.76755 },
      { x: 0.31995, y: -0.21026, r: -2.02432 },
      { x: 0.25611, y: -0.28448, r: -2.28008 },
      { x: 0.17566, y: -0.3402, r: -2.53689 },
      { x: 0.08363, y: -0.37358, r: -2.79345 },
      { x: -0.01383, y: -0.38253, r: -3.04932 },
      { x: -0.1104, y: -0.36659, r: 2.97745 },
      { x: -0.19975, y: -0.32662, r: 2.72088 },
      { x: -0.27609, y: -0.26523, r: 2.53854 },
      { x: -0.34544, y: -0.19588, r: 2.44737 },
      { x: -0.41485, y: -0.12648, r: 2.40178 },
      { x: -0.48428, y: -0.05704, r: 2.37899 },
      { x: -0.55366, y: 0.01233, r: 2.36759 },
      { x: -0.62306, y: 0.08173, r: 2.36189 },
      { x: -0.69246, y: 0.15114, r: 2.35905 },
      { x: -0.76187, y: 0.22054, r: 2.35762 },
      { x: -0.83127, y: 0.28995, r: 2.35691 }
    ],
    pq7: [
      { x: 0.31336, y: -0.85469, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17455, y: -0.71588, r: 2.35619 },
      { x: 0.10514, y: -0.64646, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43827, r: 2.35619 },
      { x: -0.17245, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.33454 },
      { x: -0.30811, y: -0.22722, r: 2.20653 },
      { x: -0.35569, y: -0.14169, r: 2.0137 },
      { x: -0.37991, y: -0.04685, r: 1.7895 },
      { x: -0.37938, y: 0.05104, r: 1.54961 },
      { x: -0.35411, y: 0.14559, r: 1.30081 },
      { x: -0.30558, y: 0.23059, r: 1.04843 },
      { x: -0.23711, y: 0.30054, r: 0.79444 },
      { x: -0.15318, y: 0.3509, r: 0.53854 },
      { x: -0.05918, y: 0.3782, r: 0.2827 },
      { x: 0.03867, y: 0.38083, r: 0.02707 },
      { x: 0.13401, y: 0.35865, r: -0.2295 },
      { x: 0.22055, y: 0.31293, r: -0.48601 },
      { x: 0.29266, y: 0.24675, r: -0.74184 },
      { x: 0.34574, y: 0.16451, r: -0.9987 },
      { x: 0.37609, y: 0.07145, r: -1.25514 },
      { x: 0.38188, y: -0.02626, r: -1.511 },
      { x: 0.36281, y: -0.12227, r: -1.76755 },
      { x: 0.31995, y: -0.21026, r: -2.02431 },
      { x: 0.25612, y: -0.28448, r: -2.28007 },
      { x: 0.17566, y: -0.3402, r: -2.53688 },
      { x: 0.08364, y: -0.37357, r: -2.79221 },
      { x: -0.01389, y: -0.38277, r: -2.9669 },
      { x: -0.11198, y: -0.38277, r: -3.05425 },
      { x: -0.2102, y: -0.38277, r: -3.09792 },
      { x: -0.30832, y: -0.38277, r: -3.11976 },
      { x: -0.40645, y: -0.38277, r: -3.13067 },
      { x: -0.50459, y: -0.38277, r: -3.13613 },
      { x: -0.60274, y: -0.38277, r: -3.13886 },
      { x: -0.70089, y: -0.38277, r: -3.14023 },
      { x: -0.79903, y: -0.38277, r: -3.14091 }
    ],
    pq8: [
      { x: 0.31336, y: -0.85469, r: 2.35619 },
      { x: 0.24393, y: -0.78526, r: 2.35619 },
      { x: 0.17455, y: -0.71588, r: 2.35619 },
      { x: 0.10514, y: -0.64646, r: 2.35619 },
      { x: 0.03573, y: -0.57706, r: 2.35619 },
      { x: -0.03365, y: -0.50768, r: 2.35619 },
      { x: -0.10305, y: -0.43827, r: 2.35619 },
      { x: -0.17245, y: -0.36887, r: 2.35619 },
      { x: -0.24185, y: -0.29948, r: 2.33454 },
      { x: -0.30811, y: -0.22722, r: 2.20653 },
      { x: -0.35569, y: -0.14169, r: 2.0137 },
      { x: -0.37991, y: -0.04685, r: 1.7895 },
      { x: -0.37938, y: 0.05104, r: 1.54961 },
      { x: -0.35411, y: 0.14559, r: 1.30081 },
      { x: -0.30558, y: 0.23059, r: 1.04843 },
      { x: -0.23711, y: 0.30054, r: 0.79444 },
      { x: -0.15318, y: 0.3509, r: 0.53854 },
      { x: -0.05918, y: 0.3782, r: 0.2827 },
      { x: 0.03867, y: 0.38083, r: 0.02707 },
      { x: 0.13401, y: 0.35865, r: -0.2295 },
      { x: 0.22055, y: 0.31293, r: -0.48601 },
      { x: 0.29266, y: 0.24675, r: -0.74184 },
      { x: 0.34574, y: 0.16451, r: -0.9987 },
      { x: 0.37609, y: 0.07145, r: -1.25514 },
      { x: 0.38188, y: -0.02626, r: -1.511 },
      { x: 0.36281, y: -0.12227, r: -1.76755 },
      { x: 0.31995, y: -0.21026, r: -2.02169 },
      { x: 0.25647, y: -0.28486, r: -2.18894 },
      { x: 0.18705, y: -0.35428, r: -2.27257 },
      { x: 0.11766, y: -0.42366, r: -2.31438 },
      { x: 0.04823, y: -0.49309, r: -2.33529 },
      { x: -0.02115, y: -0.56248, r: -2.34574 },
      { x: -0.09053, y: -0.63186, r: -2.35097 },
      { x: -0.15995, y: -0.70128, r: -2.35358 },
      { x: -0.22934, y: -0.77066, r: -2.35489 },
      { x: -0.29874, y: -0.84007, r: -2.35554 }
    ],
    s: [
      { x: 0.31336, y: -0.85468, r: 2.3562 },
      { x: 0.24396, y: -0.78529, r: 2.3562 },
      { x: 0.17456, y: -0.71589, r: 2.3562 },
      { x: 0.10512, y: -0.64645, r: 2.3562 },
      { x: 0.03572, y: -0.57705, r: 2.3562 },
      { x: -0.03367, y: -0.50766, r: 2.3562 },
      { x: -0.10306, y: -0.43827, r: 2.3562 },
      { x: -0.17245, y: -0.36887, r: 2.3562 },
      { x: -0.24186, y: -0.29947, r: 2.3562 },
      { x: -0.31125, y: -0.23008, r: 2.3562 },
      { x: -0.38065, y: -0.16068, r: 2.3562 },
      { x: -0.29484, y: -0.12213, r: 0.3927 },
      { x: -0.20417, y: -0.08457, r: 0.3927 },
      { x: -0.11347, y: -0.047, r: 0.3927 },
      { x: -0.02283, y: -946e-5, r: 0.3927 },
      { x: 0.06786, y: 0.02811, r: 0.3927 },
      { x: 0.15853, y: 0.06566, r: 0.3927 },
      { x: 0.24921, y: 0.10323, r: 0.3927 },
      { x: 0.33988, y: 0.14078, r: 0.3927 },
      { x: 0.34616, y: 0.19517, r: 2.35619 },
      { x: 0.27678, y: 0.26454, r: 2.35619 },
      { x: 0.20735, y: 0.33398, r: 2.35619 },
      { x: 0.13796, y: 0.40337, r: 2.35619 },
      { x: 0.06859, y: 0.47273, r: 2.35619 },
      { x: -84e-5, y: 0.54216, r: 2.35619 },
      { x: -0.07022, y: 0.61155, r: 2.35619 },
      { x: -0.13963, y: 0.68096, r: 2.35619 },
      { x: -0.20902, y: 0.75035, r: 2.35619 },
      { x: -0.27842, y: 0.81975, r: 2.35619 },
      { x: -0.34782, y: 0.88915, r: 2.35619 }
    ],
    v1: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: -1.1781 },
      { x: 0.03042, y: -0.07343, r: -1.1781 },
      { x: 0.06796, y: -0.16408, r: -1.1781 },
      { x: 0.10552, y: -0.25475, r: -1.1781 },
      { x: 0.14309, y: -0.34544, r: -1.1781 },
      { x: 0.18064, y: -0.4361, r: -1.1781 },
      { x: 0.2182, y: -0.52678, r: -1.1781 },
      { x: 0.25576, y: -0.61745, r: -1.1781 },
      { x: 0.29332, y: -0.70813, r: -1.1781 },
      { x: 0.33088, y: -0.79881, r: -1.1781 }
    ],
    v2: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: 0.07343, y: -0.03042, r: -0.3927 },
      { x: 0.16408, y: -0.06796, r: -0.3927 },
      { x: 0.25475, y: -0.10552, r: -0.3927 },
      { x: 0.34544, y: -0.14309, r: -0.3927 },
      { x: 0.4361, y: -0.18064, r: -0.3927 },
      { x: 0.52678, y: -0.2182, r: -0.3927 },
      { x: 0.61745, y: -0.25576, r: -0.3927 },
      { x: 0.70813, y: -0.29332, r: -0.3927 },
      { x: 0.79881, y: -0.33088, r: -0.3927 }
    ],
    v3: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: 0.07343, y: 0.03042, r: 0.3927 },
      { x: 0.16408, y: 0.06796, r: 0.3927 },
      { x: 0.25475, y: 0.10552, r: 0.3927 },
      { x: 0.34544, y: 0.14309, r: 0.3927 },
      { x: 0.4361, y: 0.18064, r: 0.3927 },
      { x: 0.52678, y: 0.2182, r: 0.3927 },
      { x: 0.61745, y: 0.25576, r: 0.3927 },
      { x: 0.70813, y: 0.29332, r: 0.3927 },
      { x: 0.79881, y: 0.33088, r: 0.3927 }
    ],
    v4: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: 0.03042, y: 0.07343, r: 1.1781 },
      { x: 0.06796, y: 0.16408, r: 1.1781 },
      { x: 0.10552, y: 0.25476, r: 1.1781 },
      { x: 0.14309, y: 0.34545, r: 1.1781 },
      { x: 0.18064, y: 0.43611, r: 1.1781 },
      { x: 0.2182, y: 0.52679, r: 1.1781 },
      { x: 0.25576, y: 0.61746, r: 1.1781 },
      { x: 0.29332, y: 0.70815, r: 1.1781 },
      { x: 0.33087, y: 0.7988, r: 1.1781 }
    ],
    v6: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: -0.07343, y: 0.03042, r: 2.74889 },
      { x: -0.16408, y: 0.06796, r: 2.74889 },
      { x: -0.25475, y: 0.10552, r: 2.74889 },
      { x: -0.34544, y: 0.14309, r: 2.74889 },
      { x: -0.4361, y: 0.18064, r: 2.74889 },
      { x: -0.52678, y: 0.2182, r: 2.74889 },
      { x: -0.61745, y: 0.25576, r: 2.74889 },
      { x: -0.70813, y: 0.29332, r: 2.74889 },
      { x: -0.79881, y: 0.33088, r: 2.74889 }
    ],
    v7: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: -0.07343, y: -0.03042, r: -2.74889 },
      { x: -0.16408, y: -0.06796, r: -2.74889 },
      { x: -0.25475, y: -0.10552, r: -2.74889 },
      { x: -0.34544, y: -0.14309, r: -2.74889 },
      { x: -0.4361, y: -0.18064, r: -2.74889 },
      { x: -0.52678, y: -0.2182, r: -2.74889 },
      { x: -0.61745, y: -0.25576, r: -2.74889 },
      { x: -0.70813, y: -0.29332, r: -2.74889 },
      { x: -0.79881, y: -0.33088, r: -2.74889 }
    ],
    v8: [
      { x: 0.34521, y: -0.83342, r: 1.9635 },
      { x: 0.30764, y: -0.74271, r: 1.9635 },
      { x: 0.27008, y: -0.65203, r: 1.9635 },
      { x: 0.23253, y: -0.56138, r: 1.9635 },
      { x: 0.19497, y: -0.47069, r: 1.9635 },
      { x: 0.1574, y: -0.37999, r: 1.9635 },
      { x: 0.11985, y: -0.28935, r: 1.9635 },
      { x: 0.08229, y: -0.19867, r: 1.9635 },
      { x: 0.04473, y: -0.10798, r: 1.9635 },
      { x: 717e-5, y: -0.01731, r: 1.9635 },
      { x: -0.03042, y: -0.07343, r: -1.9635 },
      { x: -0.06796, y: -0.16408, r: -1.9635 },
      { x: -0.10552, y: -0.25475, r: -1.9635 },
      { x: -0.14309, y: -0.34544, r: -1.9635 },
      { x: -0.18064, y: -0.4361, r: -1.9635 },
      { x: -0.2182, y: -0.52678, r: -1.9635 },
      { x: -0.25576, y: -0.61745, r: -1.9635 },
      { x: -0.29332, y: -0.70813, r: -1.9635 },
      { x: -0.33088, y: -0.79881, r: -1.9635 }
    ],
    wifi: [
      { x: 0.3266, y: -0.80594, r: 3.14159 },
      { x: 0.28748, y: -0.70204, r: 3.14159 },
      { x: 0.2393, y: -0.58179, r: 3.14159 },
      { x: 0.18855, y: -0.45616, r: 3.14159 },
      { x: 0.13267, y: -0.33053, r: 3.14159 },
      { x: 0.06809, y: -0.17406, r: 3.14159 },
      { x: 352e-5, y: -0.02339, r: 3.14159 },
      { x: -0.05795, y: 0.12625, r: 3.14159 },
      { x: -0.11942, y: 0.27341, r: 3.14159 },
      { x: -0.17882, y: 0.42429, r: 3.14159 },
      { x: -0.25354, y: 0.59359, r: 3.14159 }
    ]
  };

  // ../adx-dl/packages/maimai-chart-engine/src/core/timing/slideAppearance.ts
  var SLIDE_JUDGE_ADJUST_MS = 50;
  var TRACK_FADE_RAMP_MS = 200;
  var WIFI_TRACK_ALPHA = 120 / 255;
  function getSlideAppearanceStartMs({
    noteTimeMs,
    approachTimeMs,
    slideDelay
  }) {
    const optionIndex = Math.round((slideDelay + 1) * 10);
    return noteTimeMs - approachTimeMs + approachTimeMs * optionIndex / 21;
  }
  function isWifiTrackHalfAlpha(noteTimeMs, currentTimeMs) {
    return noteTimeMs - currentTimeMs + TRACK_FADE_RAMP_MS <= currentTimeMs;
  }
  function getSlideTrackAppearance(timing, currentTimeMs, isWifi) {
    const appearanceStart = getSlideAppearanceStartMs(timing);
    if (isWifi && currentTimeMs <= appearanceStart) return { alpha: 0, isFading: false };
    if (currentTimeMs + SLIDE_JUDGE_ADJUST_MS >= timing.noteTimeMs) {
      return { alpha: isWifi ? WIFI_TRACK_ALPHA : 1, isFading: false };
    }
    const elapsed = currentTimeMs - appearanceStart;
    if (elapsed <= 0) return { alpha: 0, isFading: false };
    if (isWifi && elapsed > TRACK_FADE_RAMP_MS) {
      return {
        alpha: isWifiTrackHalfAlpha(timing.noteTimeMs, currentTimeMs) ? 0.5 : WIFI_TRACK_ALPHA,
        isFading: false
      };
    }
    const fadeWindow = timing.noteTimeMs - appearanceStart;
    const alpha = isWifi || fadeWindow >= TRACK_FADE_RAMP_MS ? Math.min(0.5, 0.5 * elapsed / TRACK_FADE_RAMP_MS) : Math.max(0, Math.min(0.5, 0.5 * (1 - (timing.noteTimeMs - currentTimeMs) / elapsed)));
    return { alpha, isFading: alpha > 0 && alpha < 0.5 };
  }

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/SlideRenderer.ts
  var TRACKS_PER_BUILD_STEP = 12;
  var TRACK_LAYER_REBUILD_INTERVAL_MS = 33;
  var TRACK_FADE_BUCKET_MS = 25;
  var TRACK_TIME_JUMP_MS = 200;
  var SlideRenderer = class extends BaseRenderer {
    constructor(context, noteRenderer) {
      super(context);
      this.pathMetricsCache = /* @__PURE__ */ new WeakMap();
      this.uniquePathIndexesCache = /* @__PURE__ */ new WeakMap();
      // 箭头 Path2D 缓存（以画布半径与镜像模式为失效基准）
      this.arrowPathsCache = /* @__PURE__ */ new WeakMap();
      // 稳定状态轨迹的前台离屏画布（签名未变直接复用合成）
      this.trackLayer = null;
      this.trackLayerCtx = null;
      this.trackLayerSignature = "";
      this.trackLayerBuiltAtMs = -Infinity;
      // 上次合成的谱面时刻，用于识别 seek 跳变并失效缓存
      this.lastTrackRenderTimeMs = null;
      // 轨迹分帧构建的离屏暂存画布
      this.trackStaging = null;
      this.trackStagingCtx = null;
      this.trackBuildJob = null;
      this.visibleTrackEntries = [];
      this.noteRenderer = noteRenderer;
    }
    // 过滤分段几何与时序参数完全相同的重复路径，同参路径仅保留首条
    getRenderPathIndexes(note) {
      const cached = this.uniquePathIndexesCache.get(note);
      if (cached) return cached;
      const paths = note.allSlideSegments;
      const seen = /* @__PURE__ */ new Set();
      const result = [];
      for (let i2 = 0; i2 < paths.length; i2++) {
        const segs = paths[i2];
        if (!segs || segs.length === 0) continue;
        const key = [
          segs.map((s2) => `${s2.type}:${s2.startPos}:${s2.endPos}:${s2.midPos ?? ""}`).join("+"),
          note.allDelayMs?.[i2] ?? "",
          note.allDurationMs?.[i2] ?? "",
          note.allSlideBreaks?.[i2] ? 1 : 0
        ].join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(i2);
      }
      this.uniquePathIndexesCache.set(note, result);
      return result;
    }
    // 将单位圆盘模板点序列变换到当前画布坐标系，引导箭头与星头采样共用同一序列
    getBarChain(segment) {
      const shape = detectSlideShape(segment.type, segment.startPos, segment.endPos, segment.midPos);
      if (!shape) return null;
      const bars = SLIDE_BARS[shape.shape];
      if (!bars) return null;
      const mode = this.context.config.mirrorMode;
      if (segment.cachedChain && segment.cachedChainRadius === this.context.radius && segment.cachedChainMirror === mode) {
        return segment.cachedChain;
      }
      const startRotation = (segment.startPos - (shape.mirror ? 0 : 1)) * Math.PI / 4;
      const cosR = Math.cos(startRotation);
      const sinR = Math.sin(startRotation);
      const r2 = this.context.radius;
      const cx = this.context.centerX;
      const cy = this.context.centerY;
      const sx = mode === "horizontal" || mode === "rotate180" ? -1 : 1;
      const sy = mode === "vertical" || mode === "rotate180" ? -1 : 1;
      const isCircle = shape.shape.startsWith("circle");
      const CIRCLE_BAR_R = 1;
      const GRID_PER_PI = 32;
      const isLine = shape.shape.startsWith("line");
      const lfx = shape.mirror ? -bars[0].x : bars[0].x;
      const lfy = bars[0].y;
      const lineDx = (shape.mirror ? -bars[bars.length - 1].x : bars[bars.length - 1].x) - lfx;
      const lineDy = bars[bars.length - 1].y - lfy;
      const lineLen2 = lineDx * lineDx + lineDy * lineDy || 1;
      const chain = bars.map((bar) => {
        let bx = shape.mirror ? -bar.x : bar.x;
        let by = bar.y;
        if (isCircle) {
          const angle = Math.atan2(by, bx);
          const snapped = Math.round(angle * GRID_PER_PI / Math.PI) * (Math.PI / GRID_PER_PI);
          bx = Math.cos(snapped) * CIRCLE_BAR_R;
          by = Math.sin(snapped) * CIRCLE_BAR_R;
        } else if (isLine) {
          const t2 = ((bx - lfx) * lineDx + (by - lfy) * lineDy) / lineLen2;
          bx = lfx + t2 * lineDx;
          by = lfy + t2 * lineDy;
        }
        const baked = (shape.mirror ? Math.PI - bar.r : bar.r) + startRotation;
        return {
          x: cx + sx * r2 * (bx * cosR - by * sinR),
          y: cy + sy * r2 * (bx * sinR + by * cosR),
          angle: Math.atan2(sy * Math.sin(baked), sx * Math.cos(baked))
        };
      });
      const isCup = segment.type === "p" || segment.type === "q" || segment.type === "pp" || segment.type === "qq";
      const isCircleShape = shape.shape.startsWith("circle");
      if ((isCup || isCircleShape) && chain.length >= 2) {
        this.applyGameArrowAngles(chain);
      }
      segment.cachedChain = chain;
      segment.cachedChainRadius = r2;
      segment.cachedChainMirror = mode;
      return chain;
    }
    // 计算两角间最短有向角差，结果在 (-π, π]
    angleDelta(a2, b2) {
      let d2 = (b2 - a2) % (Math.PI * 2);
      if (d2 > Math.PI) d2 -= Math.PI * 2;
      if (d2 < -Math.PI) d2 += Math.PI * 2;
      return d2;
    }
    // 沿最短圆周路径线性插值
    lerpAngle(a2, b2, t2) {
      return a2 + this.angleDelta(a2, b2) * t2;
    }
    // 原地平滑引导点切向角：首尾沿线段方向，中间节点沿角平分线插值
    applyGameArrowAngles(chain) {
      const n2 = chain.length;
      const seg = new Array(n2);
      for (let i2 = 0; i2 < n2 - 1; i2++) {
        seg[i2] = Math.atan2(chain[i2 + 1].y - chain[i2].y, chain[i2 + 1].x - chain[i2].x);
      }
      seg[n2 - 1] = seg[n2 - 2];
      chain[0].angle = seg[0];
      for (let l = 1; l < n2 - 1; l++) {
        chain[l].angle = this.lerpAngle(chain[l - 1].angle, seg[l], 0.5);
      }
      chain[n2 - 1].angle = seg[n2 - 1];
    }
    /**
     * 计算 Slide 起始头部在当前时刻的位置与缩放。
     * 前半程在原位淡入，后半程向判定线展开。
     */
    calculateSlideStartPosition(note, _currentBeat, currentTimeMs) {
      const angle = this.getButtonAngle(note.position);
      const timeDiff = note.timingMs - currentTimeMs;
      const approachTime = this.getNoteApproachTimeMs(note);
      if (timeDiff > approachTime || timeDiff < -NOTE_VISIBILITY_AFTER_MS) {
        return INVISIBLE_NOTE_POSITION;
      }
      const dir = this.getNoteApproachDir(note);
      const halfApproach = approachTime / 2;
      let distance;
      let scale;
      if (timeDiff > halfApproach) {
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1));
        scale = 1 - (timeDiff - halfApproach) / halfApproach;
      } else if (timeDiff >= 0) {
        const progress = 1 - timeDiff / halfApproach;
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1 + 0.75 * progress));
        scale = 1;
      } else {
        const fadeProgress = 1 + -timeDiff / halfApproach;
        distance = this.context.radius * (1 + dir * (APPROACH_START_SCALE - 1 + 0.75 * fadeProgress));
        scale = 1;
      }
      return {
        x: this.context.centerX + Math.cos(angle) * distance,
        y: this.context.centerY + Math.sin(angle) * distance,
        scale,
        visible: true
      };
    }
    /**
     * 渲染单个 Slide（引导轨迹或滑动星头）。
     * 多分支时 Wi-Fi 扇形面积大，先画置于底层，避免遮挡常规分支。
     */
    renderSlide(note, currentBeat, currentTimeMs, mode = "tracks", hasSimultaneousSlide) {
      if (note.isSplitSlide && note.allSlideSegments) {
        const paths = note.allSlideSegments;
        const pathIndexes = this.getRenderPathIndexes(note);
        for (const i2 of pathIndexes) {
          const segs = paths[i2];
          if (segs[0].type === "w") {
            this.renderSlidePath(
              note,
              currentBeat,
              currentTimeMs,
              segs,
              i2,
              mode,
              hasSimultaneousSlide
            );
          }
        }
        for (const i2 of pathIndexes) {
          const segs = paths[i2];
          if (segs[0].type !== "w") {
            this.renderSlidePath(
              note,
              currentBeat,
              currentTimeMs,
              segs,
              i2,
              mode,
              hasSimultaneousSlide
            );
          }
        }
      } else if (note.slideSegments && note.slideSegments.length > 0) {
        this.renderSlidePath(
          note,
          currentBeat,
          currentTimeMs,
          note.slideSegments,
          0,
          mode,
          hasSimultaneousSlide
        );
      }
    }
    // 渲染单条 Slide 路径，轨迹按分段逆序绘制，保证前段及其接合箭头盖在后段之上
    renderSlidePath(note, _currentBeat, currentTimeMs, segments, pathIndex = 0, mode = "tracks", hasSimultaneousSlide) {
      const durationMs = note.allDurationMs ? note.allDurationMs[pathIndex] : note.durationMs;
      const delayMs = note.allDelayMs ? note.allDelayMs[pathIndex] : note.delayMs ?? 6e4 / note.bpm;
      const slideStart = note.timingMs + delayMs;
      if (currentTimeMs > slideStart + durationMs) {
        return;
      }
      let progress = 0;
      if (currentTimeMs >= slideStart) {
        progress = durationMs > 0 ? Math.min(1, (currentTimeMs - slideStart) / durationMs) : 1;
      }
      const isSimultaneous = hasSimultaneousSlide || (note.isSplitSlide ?? false);
      if (mode === "stars") {
        if (currentTimeMs >= note.timingMs) {
          this.renderSlideStar(note, progress, segments, pathIndex, currentTimeMs, isSimultaneous);
        }
        return;
      }
      const ordinary = this.getTrackAppearance(note, currentTimeMs, false);
      const wifi = this.getTrackAppearance(note, currentTimeMs, true);
      if (ordinary.alpha === 0 && wifi.alpha === 0) return;
      const isBreak = note.allSlideBreaks?.[pathIndex] ?? false;
      const metrics = this.getSlidePathMetrics(segments);
      if (!metrics) return;
      this.withContext(() => {
        for (let i2 = segments.length - 1; i2 >= 0; i2--) {
          const segment = segments[i2];
          const alpha = segment.type === "w" ? wifi.alpha : ordinary.alpha;
          if (alpha === 0) continue;
          this.context.ctx.globalAlpha = alpha;
          const range = metrics.segmentRanges[i2];
          let segmentProgress = 0;
          if (progress > range.start) {
            segmentProgress = progress >= range.end ? 1 : (progress - range.start) / (range.end - range.start);
          }
          this.renderSlideSegment(
            segment,
            isBreak,
            segmentProgress,
            isSimultaneous,
            this.context.config.normalColorBreakSlide,
            i2 < segments.length - 1
            // 非末段的终点为接合拐点，需补充衔接箭头
          );
        }
      });
    }
    // 计算轨迹透明度与淡入状态，出现时机由 config.slideDelay 决定，与星星移动进度无关
    getTrackAppearance(note, currentTimeMs, isWifi) {
      return getSlideTrackAppearance(
        {
          noteTimeMs: note.timingMs,
          approachTimeMs: this.getNoteApproachTimeMs(note),
          slideDelay: this.context.config.slideDelay
        },
        currentTimeMs,
        isWifi
      );
    }
    // 获取分段几何弧长及归一化累计区间，以画布半径和镜像模式为失效基准
    getSlidePathMetrics(segments) {
      const radius = this.context.radius;
      const mirrorMode = this.context.config.mirrorMode;
      const cached = this.pathMetricsCache.get(segments);
      if (cached && cached.radius === radius && cached.mirrorMode === mirrorMode) {
        return cached;
      }
      const segmentLengths = new Array(segments.length);
      let totalLength = 0;
      for (let i2 = 0; i2 < segments.length; i2++) {
        const length = this.getSegmentLength(segments[i2]);
        segmentLengths[i2] = length;
        totalLength += length;
      }
      if (totalLength <= 0) return null;
      const segmentRanges = new Array(segments.length);
      let cumulative = 0;
      for (let i2 = 0; i2 < segments.length; i2++) {
        const start = cumulative / totalLength;
        cumulative += segmentLengths[i2];
        segmentRanges[i2] = { start, end: cumulative / totalLength };
      }
      const metrics = {
        radius,
        mirrorMode,
        segmentRanges
      };
      this.pathMetricsCache.set(segments, metrics);
      return metrics;
    }
    /**
     * 渲染单段滑条引导轨迹。
     *
     * @param segment 滑条段配置。
     * @param isBreak 是否为 Break 属性。
     * @param progress 当前段的滑动完成进度 [0, 1]。
     * @param isSimultaneous 是否与其他音符双押。
     * @param normalBreakColor Break 是否使用常规配色。
     * @param isJunctionEnd 是否为多段拼接中的非末段终点（需补衔接箭头）。
     * @returns 渲染是否执行。
     */
    renderSlideSegment(segment, isBreak, progress = 0, isSimultaneous = false, normalBreakColor = false, isJunctionEnd = false) {
      this.withContext(() => {
        const ctx = this.context.ctx;
        ctx.lineWidth = this.scaleByRadius(SLIDE_ARROW_WIDTH_RATIO);
        if (isBreak && !normalBreakColor) {
          ctx.strokeStyle = COLORS.BREAK_ORANGE;
        } else if (isSimultaneous) {
          ctx.strokeStyle = COLORS.SLIDE_SIMULTANEOUS;
        } else {
          ctx.strokeStyle = COLORS.SLIDE_CYAN;
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (segment.type === "w") {
          this.renderWifiBars(segment, progress);
          return;
        }
        this.drawSegmentArrows(segment, progress, isJunctionEnd);
      });
      return true;
    }
    // 渲染 Wi-Fi 扇形滑条的展开箭头阵列：对称 V 形六边形沿扩散轴排列
    renderWifiBars(segment, progress) {
      const steps = SLIDE_AREA_STEP_MAP["wifi"];
      const N2 = steps[steps.length - 1];
      const hiddenCount = this.getHiddenCount(segment, progress);
      const pivot = this.noteRenderer.getPositionOnRing(segment.startPos);
      const endPivot = this.noteRenderer.getPositionOnRing(segment.endPos);
      const axisLen = Math.hypot(endPivot.x - pivot.x, endPivot.y - pivot.y);
      if (axisLen === 0) return;
      const axisUx = (endPivot.x - pivot.x) / axisLen;
      const axisUy = (endPivot.y - pivot.y) / axisLen;
      const fanAngle = Math.atan2(axisUy, axisUx);
      const ARM_HALF_ANGLE = 67.4 * Math.PI / 180;
      const cosA = Math.cos(ARM_HALF_ANGLE);
      const sinA = Math.sin(ARM_HALF_ANGLE);
      const dFirst = 0.075 * axisLen;
      const dLast = 0.975 * axisLen;
      const startExtra = this.scaleByRadius(0.075);
      const chevrons = [];
      for (let i2 = N2 - 1; i2 >= hiddenCount; i2--) {
        const t2 = i2 / (N2 - 1);
        const d2 = dFirst + (dLast - dFirst) * SLIDE_WIFI_CORNER_FRACS[i2];
        const armLen = cosA * d2 + startExtra * (1 - t2);
        const width = this.scaleByRadius(SLIDE_WIFI_LINE_WIDTH_RATIO * (0.7 + 0.3 * t2));
        chevrons.push({
          x: pivot.x + axisUx * d2,
          y: pivot.y + axisUy * d2,
          arm1Dx: -armLen * cosA,
          arm1Dy: +armLen * sinA,
          arm2Dx: -armLen * cosA,
          arm2Dy: -armLen * sinA,
          width
        });
      }
      if (chevrons.length === 0) return;
      this.drawWifiChevronsBatch(chevrons, fanAngle);
    }
    // 生成音符在当前时刻的轨迹缓存签名。淡入期按 TRACK_FADE_BUCKET_MS 分桶，稳定后写实际 alpha
    trackStateKey(note, currentTimeMs) {
      const ordinary = this.getTrackAppearance(note, currentTimeMs, false);
      const wifi = this.getTrackAppearance(note, currentTimeMs, true);
      if (ordinary.alpha === 0 && wifi.alpha === 0) {
        return { key: "", hasVisibleTrack: false };
      }
      const fadeBucket = `~${Math.floor(currentTimeMs / TRACK_FADE_BUCKET_MS)}`;
      const pathIndexes = note.isSplitSlide && note.allSlideSegments ? this.getRenderPathIndexes(note) : [0];
      let key = "";
      for (const i2 of pathIndexes) {
        const segments = note.allSlideSegments ? note.allSlideSegments[i2] : note.slideSegments;
        if (!segments || segments.length === 0) continue;
        const durationMs = note.allDurationMs ? note.allDurationMs[i2] : note.durationMs;
        const delayMs = note.allDelayMs ? note.allDelayMs[i2] : note.delayMs ?? 6e4 / note.bpm;
        const slideStart = note.timingMs + delayMs;
        if (currentTimeMs > slideStart + durationMs) {
          key += "|x";
          continue;
        }
        let progress = 0;
        if (currentTimeMs >= slideStart) {
          progress = durationMs > 0 ? Math.min(1, (currentTimeMs - slideStart) / durationMs) : 1;
        }
        key += `|${i2}`;
        const metrics = this.getSlidePathMetrics(segments);
        if (!metrics) continue;
        for (let s2 = 0; s2 < segments.length; s2++) {
          const appearance = segments[s2].type === "w" ? wifi : ordinary;
          key += appearance.isFading ? `:${fadeBucket}` : `:${appearance.alpha}`;
          if (appearance.alpha === 0) continue;
          const range = metrics.segmentRanges[s2];
          let segmentProgress = 0;
          if (progress > range.start) {
            segmentProgress = progress >= range.end ? 1 : (progress - range.start) / (range.end - range.start);
          }
          key += `,${this.getHiddenCount(segments[s2], segmentProgress)}`;
        }
      }
      return { key, hasVisibleTrack: true };
    }
    // 丢弃在途重建并清空缓存层，重建完成前合成空层，避免画出上一张谱的残留轨迹
    invalidateTrackLayer() {
      this.lastTrackRenderTimeMs = null;
      if (this.trackLayerSignature === "" && !this.trackBuildJob) return;
      this.trackLayerSignature = "";
      this.trackBuildJob = null;
      this.trackLayerBuiltAtMs = -Infinity;
      this.clearTrackLayer();
    }
    clearTrackLayer() {
      if (!this.trackLayer || !this.trackLayerCtx) return;
      this.trackLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.trackLayerCtx.clearRect(0, 0, this.trackLayer.width, this.trackLayer.height);
    }
    /**
     * 批量渲染稳定状态下的轨迹。
     * 双缓冲机制：签名未变时直接复用前台离屏画布（单次 drawImage 合成）；
     * 签名变化时在后台暂存画布分帧构建（每帧上限 TRACKS_PER_BUILD_STEP 条，受 TRACK_LAYER_REBUILD_INTERVAL_MS 节流）。
     * requireCompleteLayer=true（暂停、定格、GIF 导出）时当帧同步完成。
     */
    renderStableTracks(entries, currentBeat, currentTimeMs, requireCompleteLayer) {
      const mainCtx = this.context.ctx;
      const canvas2 = this.context.canvas;
      const frameDeltaMs = currentTimeMs - (this.lastTrackRenderTimeMs ?? currentTimeMs);
      if (frameDeltaMs < 0 || frameDeltaMs > TRACK_TIME_JUMP_MS) {
        this.invalidateTrackLayer();
      }
      this.lastTrackRenderTimeMs = currentTimeMs;
      if (entries.length === 0) {
        this.invalidateTrackLayer();
        return;
      }
      const { config } = this.context;
      let signature = `${canvas2.width}x${canvas2.height}|${this.context.radius}|${config.mirrorMode}|${config.normalColorBreakSlide ? 1 : 0}|${config.slideDelay}|${this.getApproachTimeMs()}`;
      const visible = this.visibleTrackEntries;
      visible.length = 0;
      for (const entry of entries) {
        const state = this.trackStateKey(entry.note, currentTimeMs);
        if (!state.hasVisibleTrack) continue;
        signature += `;${entry.index}:${entry.isSimultaneous ? 1 : 0}${state.key}`;
        visible.push(entry);
      }
      const job = this.trackBuildJob;
      const noFrontLayer = !this.trackLayer;
      if (signature === this.trackLayerSignature) {
        this.trackBuildJob = null;
      } else if (job && job.signature === signature) {
        do {
          this.advanceTrackBuildJob(job);
        } while (this.trackBuildJob && (requireCompleteLayer || noFrontLayer));
      } else {
        const elapsedSinceBuildMs = Math.abs(currentTimeMs - this.trackLayerBuiltAtMs);
        if (requireCompleteLayer || noFrontLayer || elapsedSinceBuildMs >= TRACK_LAYER_REBUILD_INTERVAL_MS) {
          this.trackBuildJob = {
            signature,
            entries: visible.slice(),
            currentBeat,
            currentTimeMs,
            nextIndex: 0,
            staging: this.acquireTrackStaging(canvas2, mainCtx)
          };
          do {
            this.advanceTrackBuildJob(this.trackBuildJob);
          } while (this.trackBuildJob && (requireCompleteLayer || noFrontLayer));
        }
      }
      if (!this.trackLayer) return;
      mainCtx.save();
      mainCtx.setTransform(1, 0, 0, 1, 0, 0);
      mainCtx.drawImage(this.trackLayer, 0, 0);
      mainCtx.restore();
    }
    // 获取或初始化用于后台分帧构建的暂存画布，对齐主画布尺寸与变换
    acquireTrackStaging(canvas2, mainCtx) {
      if (!this.trackStaging || this.trackStaging.width !== canvas2.width || this.trackStaging.height !== canvas2.height) {
        this.trackStaging = document.createElement("canvas");
        this.trackStaging.width = canvas2.width;
        this.trackStaging.height = canvas2.height;
        this.trackStagingCtx = this.trackStaging.getContext("2d");
      }
      const ctx = this.trackStagingCtx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.trackStaging.width, this.trackStaging.height);
      ctx.setTransform(mainCtx.getTransform());
      return this.trackStaging;
    }
    // 推进分帧构建：单次最多画 TRACKS_PER_BUILD_STEP 条，完成后与前台画布交换并更新签名
    advanceTrackBuildJob(job) {
      const mainCtx = this.context.ctx;
      this.context.ctx = this.trackStagingCtx;
      try {
        const end = Math.min(job.entries.length, job.nextIndex + TRACKS_PER_BUILD_STEP);
        for (; job.nextIndex < end; job.nextIndex++) {
          const entry = job.entries[job.nextIndex];
          this.renderSlide(
            entry.note,
            job.currentBeat,
            job.currentTimeMs,
            "tracks",
            entry.isSimultaneous
          );
        }
      } finally {
        this.context.ctx = mainCtx;
      }
      if (job.nextIndex >= job.entries.length) {
        const front = this.trackLayer;
        const frontCtx = this.trackLayerCtx;
        this.trackLayer = job.staging;
        this.trackLayerCtx = this.trackStagingCtx;
        this.trackStaging = front;
        this.trackStagingCtx = frontCtx;
        this.trackLayerSignature = job.signature;
        this.trackLayerBuiltAtMs = job.currentTimeMs;
        this.trackBuildJob = null;
      }
    }
    // 根据滑动进度查步进表计算已隐藏的箭头数
    getHiddenCount(segment, progress) {
      const shape = detectSlideShape(segment.type, segment.startPos, segment.endPos, segment.midPos);
      if (!shape) return 0;
      const steps = SLIDE_AREA_STEP_MAP[shape.shape];
      const hiddenCount = steps && steps.length >= 2 ? steps[Math.min(steps.length - 1, Math.floor(progress * (steps.length - 1)))] : 0;
      return segment.type === "w" && progress > 0 ? hiddenCount + 1 : hiddenCount;
    }
    // 绘制单段 Slide 的可见箭头（阴影、本体、Break 双色分层绘制），缓存 Path2D
    drawSegmentArrows(segment, progress, isJunctionEnd) {
      const chain = this.getBarChain(segment);
      if (!chain) return;
      const basis = `${this.context.radius}|${this.context.config.mirrorMode}`;
      let cache = this.arrowPathsCache.get(segment);
      if (!cache || cache.basis !== basis) {
        cache = { basis, byKey: /* @__PURE__ */ new Map() };
        this.arrowPathsCache.set(segment, cache);
      }
      const hiddenCount = this.getHiddenCount(segment, progress);
      const key = `${hiddenCount}|${isJunctionEnd ? 1 : 0}`;
      let paths = cache.byKey.get(key);
      if (!paths) {
        const bars = this.getVisibleBarsForSegment(segment, hiddenCount, isJunctionEnd);
        if (!bars || bars.length === 0) return;
        paths = this.buildArrowPaths(bars);
        cache.byKey.set(key, paths);
      }
      const ctx = this.context.ctx;
      const mainStroke = ctx.strokeStyle;
      const isBreak = typeof mainStroke === "string" && mainStroke.toLowerCase() === COLORS.BREAK_ORANGE.toLowerCase();
      const leftColor = isBreak ? COLORS.SLIDE_SIMULTANEOUS : mainStroke;
      const rightColor = isBreak ? COLORS.SLIDE_ARROW_RIGHT : mainStroke;
      ctx.save();
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      ctx.lineWidth = this.getNoteStrokeWidth();
      const baseAlpha = ctx.globalAlpha;
      for (const arrow of paths) {
        ctx.globalAlpha = baseAlpha * 0.4;
        ctx.fillStyle = COLORS.BLACK;
        ctx.fill(arrow.shadow);
        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = rightColor;
        ctx.fill(arrow.main);
        if (isBreak) {
          ctx.fillStyle = leftColor;
          ctx.fill(arrow.leftHalf);
        }
        ctx.strokeStyle = COLORS.BLACK;
        ctx.stroke(arrow.main);
      }
      ctx.restore();
    }
    // 获取当前进度下可见箭头的坐标与切向角序列
    getVisibleBarsForSegment(segment, hiddenCount, isJunctionEnd = false) {
      if (segment.type === "w") return null;
      const chain = this.getBarChain(segment);
      if (!chain) return null;
      const usePrecomputedAngle = segment.type !== "-";
      const result = [];
      const last = chain.length - 1;
      if (isJunctionEnd && chain.length >= 2 && hiddenCount < chain.length) {
        const a2 = chain[last];
        const b2 = chain[last - 1];
        const jx = 2 * a2.x - b2.x;
        const jy = 2 * a2.y - b2.y;
        if (this.distanceToCenter(jx, jy) <= this.context.radius) {
          const angle = usePrecomputedAngle ? a2.angle : Math.atan2(a2.y - b2.y, a2.x - b2.x);
          result.push({ x: jx, y: jy, angle });
        }
      }
      for (let i2 = last; i2 >= hiddenCount; i2--) {
        let angle;
        if (usePrecomputedAngle) {
          angle = chain[i2].angle;
        } else {
          const lo = Math.max(0, i2 - 1);
          const hi = Math.min(last, i2 + 1);
          angle = Math.atan2(chain[hi].y - chain[lo].y, chain[hi].x - chain[lo].x);
        }
        result.push({ x: chain[i2].x, y: chain[i2].y, angle });
      }
      return result;
    }
    // 对参数化曲线等步长采样构建弧长 LUT，起点切向角用 t->0 出向角保证方向连续
    buildArcLut(pathFn, samples = 64) {
      const lut = new Array(samples + 1);
      const p0 = pathFn(0);
      const p1 = pathFn(1 / samples);
      lut[0] = { x: p0.x, y: p0.y, angle: Math.atan2(p1.y - p0.y, p1.x - p0.x), s: 0 };
      let prev = p0;
      let acc = 0;
      for (let i2 = 1; i2 <= samples; i2++) {
        const cur = i2 === 1 ? p1 : pathFn(i2 / samples);
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        acc += Math.hypot(dx, dy);
        lut[i2] = { x: cur.x, y: cur.y, angle: Math.atan2(dy, dx), s: acc };
        prev = cur;
      }
      return lut;
    }
    // 获取指定分段的弧长 LUT（缓存在分段对象上），以半径和镜像模式为失效基准
    getSegmentLut(segment) {
      const mode = this.context.config.mirrorMode;
      if (segment.cachedLut && segment.cachedRadius === this.context.radius && segment.cachedMirrorMode === mode) {
        return segment.cachedLut;
      }
      const lut = this.buildArcLut((t2) => this.getPointOnSegment(segment, t2));
      segment.cachedLut = lut;
      segment.cachedLength = lut[lut.length - 1].s;
      segment.cachedRadius = this.context.radius;
      segment.cachedMirrorMode = mode;
      return lut;
    }
    // 在 LUT 中二分查找并线性插值计算坐标与切向角。角度直接取区间入向角，避免回转点插值抖动
    sampleArcLut(lut, s2) {
      if (s2 <= 0) {
        const f = lut[0];
        return { x: f.x, y: f.y, angle: f.angle };
      }
      const last = lut[lut.length - 1];
      if (s2 >= last.s) {
        return { x: last.x, y: last.y, angle: last.angle };
      }
      let lo = 0;
      let hi = lut.length - 1;
      while (hi - lo > 1) {
        const mid = lo + hi >>> 1;
        if (lut[mid].s <= s2) lo = mid;
        else hi = mid;
      }
      const a2 = lut[lo];
      const b2 = lut[hi];
      const span = b2.s - a2.s;
      const u = span > 0 ? (s2 - a2.s) / span : 0;
      return {
        x: a2.x + (b2.x - a2.x) * u,
        y: a2.y + (b2.y - a2.y) * u,
        angle: b2.angle
      };
    }
    // 计算两条相交线段在角顶点处的内角平分线偏移点，用于生成恒定线宽折角
    getBisectorPoint(x1, y1, x2, y2, x3, y3, width) {
      const rLen = Math.hypot(x1 - x2, y1 - y2);
      const lLen = Math.hypot(x3 - x2, y3 - y2);
      if (rLen === 0 || lLen === 0) return null;
      const cosAngle = Math.max(
        -1,
        Math.min(1, ((x1 - x2) * (x3 - x2) + (y1 - y2) * (y3 - y2)) / (rLen * lLen))
      );
      const sinHalf = Math.sqrt((1 - cosAngle) / 2);
      if (sinHalf <= 1e-3) return null;
      const midX = (x1 + x3) / 2;
      const midY = (y1 + y3) / 2;
      const bLen = Math.hypot(midX - x2, midY - y2);
      const bux = (midX - x2) / bLen;
      const buy = (midY - y2) / bLen;
      const edgeLen = width / sinHalf;
      return { bx: x2 + bux * edgeLen, by: y2 + buy * edgeLen };
    }
    // 构建箭头 Path2D 集合：本体、反向偏移阴影、Break 左半部遮罩
    buildArrowPaths(arrows) {
      const arrowHeight = this.scaleByRadius(SLIDE_ARROW_HEIGHT_RATIO);
      const arrowWidth = this.scaleByRadius(SLIDE_ARROW_SPAN_RATIO);
      const lineWidth = this.scaleByRadius(SLIDE_ARROW_WIDTH_RATIO);
      const pad = this.scaleByRadius(SLIDE_ARROW_PADDING_RATIO);
      const shadowOffset = this.scaleByRadius(5 / 300);
      const result = [];
      for (const arrow of arrows) {
        const cos = Math.cos(arrow.angle);
        const sin = Math.sin(arrow.angle);
        const ax = arrow.x + cos * pad;
        const ay = arrow.y + sin * pad;
        const x1 = ax + cos * (-arrowWidth / 2) - sin * (-arrowHeight / 2);
        const y1 = ay + sin * (-arrowWidth / 2) + cos * (-arrowHeight / 2);
        const x2 = ax + cos * (arrowWidth / 2);
        const y2 = ay + sin * (arrowWidth / 2);
        const x3 = ax + cos * (-arrowWidth / 2) - sin * (arrowHeight / 2);
        const y3 = ay + sin * (-arrowWidth / 2) + cos * (arrowHeight / 2);
        const bp = this.getBisectorPoint(x1, y1, x2, y2, x3, y3, lineWidth);
        if (!bp) continue;
        const { bx, by } = bp;
        const bx3 = bx + x3 - x2;
        const by3 = by + y3 - y2;
        const bx1 = bx + x1 - x2;
        const by1 = by + y1 - y2;
        const main = new Path2D();
        main.moveTo(x2, y2);
        main.lineTo(x3, y3);
        main.lineTo(bx3, by3);
        main.lineTo(bx, by);
        main.lineTo(bx1, by1);
        main.lineTo(x1, y1);
        main.closePath();
        const shadow = new Path2D();
        const sx = -cos * shadowOffset;
        const sy = -sin * shadowOffset;
        shadow.moveTo(x2 + sx, y2 + sy);
        shadow.lineTo(x3 + sx, y3 + sy);
        shadow.lineTo(bx3 + sx, by3 + sy);
        shadow.lineTo(bx + sx, by + sy);
        shadow.lineTo(bx1 + sx, by1 + sy);
        shadow.lineTo(x1 + sx, y1 + sy);
        shadow.closePath();
        const leftHalf = new Path2D();
        leftHalf.moveTo(x2, y2);
        leftHalf.lineTo(bx, by);
        leftHalf.lineTo(bx3, by3);
        leftHalf.lineTo(x3, y3);
        leftHalf.closePath();
        result.push({ main, shadow, leftHalf });
      }
      return result;
    }
    // 批量绘制 Wi-Fi 扇形的 V 形展开条带：六边形闭合填充，避免描边端点的圆头瑕疵
    drawWifiChevronsBatch(chevrons, fanAngle) {
      if (chevrons.length === 0) return;
      const ctx = this.context.ctx;
      const shadowOffset = this.scaleByRadius(5 / 300);
      const mainStroke = ctx.strokeStyle;
      const cos = Math.cos(fanAngle);
      const sin = Math.sin(fanAngle);
      const buildChevronPath = (cornerX, cornerY, arm1X, arm1Y, arm2X, arm2Y, width) => {
        const arm1Dx = arm1X - cornerX;
        const arm1Dy = arm1Y - cornerY;
        const arm2Dx = arm2X - cornerX;
        const arm2Dy = arm2Y - cornerY;
        const arm1Len = Math.hypot(arm1Dx, arm1Dy);
        const arm2Len = Math.hypot(arm2Dx, arm2Dy);
        if (arm1Len === 0 || arm2Len === 0) return null;
        const cosAngle = Math.max(
          -1,
          Math.min(1, (arm1Dx * arm2Dx + arm1Dy * arm2Dy) / (arm1Len * arm2Len))
        );
        const sinHalf = Math.sqrt((1 - cosAngle) / 2);
        if (sinHalf <= 1e-3) return null;
        const armAxisProjection = -((arm1Dx * cos + arm1Dy * sin) / arm1Len);
        if (armAxisProjection <= 0) return null;
        const outerDistance = arm1Len / armAxisProjection;
        const innerDistance = Math.max(0, outerDistance - width / sinHalf);
        const innerScale = innerDistance / outerDistance;
        const pivotX = cornerX - cos * outerDistance;
        const pivotY = cornerY - sin * outerDistance;
        const innerCornerX = pivotX + (cornerX - pivotX) * innerScale;
        const innerCornerY = pivotY + (cornerY - pivotY) * innerScale;
        const innerArm1X = pivotX + (arm1X - pivotX) * innerScale;
        const innerArm1Y = pivotY + (arm1Y - pivotY) * innerScale;
        const innerArm2X = pivotX + (arm2X - pivotX) * innerScale;
        const innerArm2Y = pivotY + (arm2Y - pivotY) * innerScale;
        const path = new Path2D();
        path.moveTo(arm1X, arm1Y);
        path.lineTo(cornerX, cornerY);
        path.lineTo(arm2X, arm2Y);
        path.lineTo(innerArm2X, innerArm2Y);
        path.lineTo(innerCornerX, innerCornerY);
        path.lineTo(innerArm1X, innerArm1Y);
        path.closePath();
        return path;
      };
      ctx.save();
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      const fanPath = new Path2D();
      for (const c2 of chevrons) {
        const a1x = c2.x + cos * c2.arm1Dx - sin * c2.arm1Dy;
        const a1y = c2.y + sin * c2.arm1Dx + cos * c2.arm1Dy;
        const a2x = c2.x + cos * c2.arm2Dx - sin * c2.arm2Dy;
        const a2y = c2.y + sin * c2.arm2Dx + cos * c2.arm2Dy;
        const shape = buildChevronPath(c2.x, c2.y, a1x, a1y, a2x, a2y, c2.width);
        if (shape) fanPath.addPath(shape);
      }
      ctx.save();
      ctx.translate(-cos * shadowOffset, -sin * shadowOffset);
      ctx.globalAlpha = ctx.globalAlpha * 0.4;
      ctx.fillStyle = COLORS.BLACK;
      ctx.fill(fanPath);
      ctx.restore();
      ctx.fillStyle = mainStroke;
      ctx.fill(fanPath);
      ctx.restore();
    }
    /**
     * 渲染 Slide 星头（单颗常规星头）。
     * 滑行前在起始按键缩放淡入，滑行期间沿路径运动并旋转。
     */
    renderSlideStar(note, progress, segments, pathIndex, currentTimeMs, isSimultaneous) {
      if (segments.length > 0 && segments[0].type === "w") {
        this.renderWifiStars(note, progress, segments, currentTimeMs, isSimultaneous, pathIndex);
        return;
      }
      const delayMs = note.allDelayMs?.[pathIndex] ?? note.delayMs ?? 6e4 / note.bpm;
      const slideStart = note.timingMs + delayMs;
      let starPos;
      let starAlpha = 1;
      let starScale = 1;
      let rotation = 0;
      const isSliding = currentTimeMs >= slideStart;
      if (!isSliding) {
        if (note.headlessMode === "pop") return;
        starPos = this.noteRenderer.getPositionOnRing(segments[0].startPos);
        const elapsed = currentTimeMs - note.timingMs;
        const waitingProgress = Math.min(1, elapsed / delayMs);
        starAlpha = waitingProgress;
        starScale = SLIDE_STAR_WAITING_MIN_SCALE + (1 - SLIDE_STAR_WAITING_MIN_SCALE) * waitingProgress;
        if (this.context.config.slideRotation) {
          rotation = this.getPathTangentAngle(0, segments) + Math.PI / 2;
        }
      } else {
        starPos = this.getPointAlongPath(progress, segments);
        starAlpha = 1;
        starScale = 1;
        if (this.context.config.slideRotation) {
          rotation = this.getPathTangentAngle(progress, segments) + Math.PI / 2;
        }
      }
      if (!starPos) return;
      this.withContext(() => {
        this.context.ctx.globalAlpha = starAlpha;
        const size = this.context.radius * SLIDE_STAR_SIZE_RATIO * starScale;
        let color;
        const isBreak = note.allSlideBreaks?.[pathIndex] && !this.context.config.normalColorBreakSlide;
        if (isBreak) {
          color = COLORS.BREAK_ORANGE;
        } else if (isSimultaneous) {
          color = COLORS.SLIDE_SIMULTANEOUS;
        } else {
          color = this.context.config.pinkSlideStart ? COLORS.SLIDE_PINK : COLORS.SLIDE_CYAN;
        }
        this.drawStar(starPos.x, starPos.y, size, color, rotation, note.isEx ?? false);
      });
    }
    // 渲染 Wi-Fi 滑条的三星并排星头（中心与两侧相邻按键共三颗）
    renderWifiStars(note, progress, segments, currentTimeMs, isSimultaneous, pathIndex) {
      const delayMs = note.allDelayMs?.[pathIndex] ?? note.delayMs ?? 6e4 / note.bpm;
      const slideStart = note.timingMs + delayMs;
      const startPos = segments[0].startPos;
      const endPos = segments[0].endPos;
      const fanPositions = [
        { startPos, endPos },
        { startPos, endPos: (endPos - 1 - 1 + 8) % 8 + 1 },
        { startPos, endPos: (endPos - 1 + 1) % 8 + 1 }
      ];
      this.withContext(() => {
        this.context.ctx.globalAlpha = 1;
        for (const fan of fanPositions) {
          const start = this.noteRenderer.getPositionOnRing(fan.startPos);
          const end = this.noteRenderer.getPositionOnRing(fan.endPos);
          const direction = Math.atan2(end.y - start.y, end.x - start.x);
          const rotation = this.context.config.slideRotation ? direction + Math.PI / 2 : 0;
          let starPos;
          let starAlpha = 1;
          let starScale = 1;
          if (currentTimeMs < slideStart) {
            if (note.headlessMode === "pop") continue;
            starPos = start;
            const elapsed = currentTimeMs - note.timingMs;
            const waitingProgress = Math.min(1, elapsed / delayMs);
            starAlpha = waitingProgress;
            starScale = SLIDE_STAR_WAITING_MIN_SCALE + (1 - SLIDE_STAR_WAITING_MIN_SCALE) * waitingProgress;
          } else {
            starPos = {
              x: start.x + (end.x - start.x) * progress,
              y: start.y + (end.y - start.y) * progress
            };
          }
          if (starPos) {
            this.context.ctx.globalAlpha = starAlpha;
            const size = this.context.radius * SLIDE_STAR_SIZE_RATIO * starScale;
            const isBreak = note.allSlideBreaks?.[pathIndex] && !this.context.config.normalColorBreakSlide;
            let color;
            if (isBreak) {
              color = COLORS.BREAK_ORANGE;
            } else if (isSimultaneous) {
              color = COLORS.SLIDE_SIMULTANEOUS;
            } else {
              color = this.context.config.pinkSlideStart ? COLORS.SLIDE_PINK : COLORS.SLIDE_CYAN;
            }
            this.drawStar(starPos.x, starPos.y, size, color, rotation, note.isEx ?? false);
          }
        }
      });
    }
    // 绘制单颗五角星音符头部（黑底描边、镂空环面、白色轮廓及中心圆点）
    drawStar(x2, y2, size, color, rotation = 0, isEx = false) {
      this.withContext(() => {
        const ctx = this.context.ctx;
        if (rotation !== 0) {
          ctx.translate(x2, y2);
          ctx.rotate(rotation);
          ctx.translate(-x2, -y2);
        }
        const outerRadius = size;
        const innerRadius = size * 0.5;
        const innerHoleOuter = outerRadius * 0.55;
        const innerHoleInner = innerRadius * 0.55;
        const strokeW = this.getNoteStrokeWidth();
        if (!isEx) {
          ctx.beginPath();
          for (let i2 = 0; i2 < 10; i2++) {
            const angle = i2 * Math.PI / 5 - Math.PI / 2;
            const radius = i2 % 2 === 0 ? outerRadius : innerRadius;
            const px = x2 + Math.cos(angle) * radius;
            const py = y2 + Math.sin(angle) * radius;
            if (i2 === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          this.stroke(COLORS.BLACK, strokeW * 3);
        }
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerHoleOuter : innerHoleInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        this.stroke(COLORS.BLACK, strokeW * 3);
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? outerRadius : innerRadius;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        for (let i2 = 9; i2 >= 0; i2--) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerHoleOuter : innerHoleInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 9) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? outerRadius : innerRadius;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        this.stroke(COLORS.WHITE);
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerHoleOuter : innerHoleInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        this.stroke(COLORS.WHITE);
        const centerSize = size * 0.15;
        ctx.beginPath();
        ctx.arc(x2, y2, centerSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    }
    // 渲染 EX Slide 星头的外层发光五角星光环
    renderExStarRing(x2, y2, size, isBreak = false, isSimultaneous = false, scaleFactor = 1) {
      this.withContext(() => {
        const ctx = this.context.ctx;
        const scale = 1.19 * scaleFactor;
        const outerRadius = size * scale;
        const outerInner = size * 0.5 * scale;
        const innerRadius = size;
        const innerInner = size * 0.5;
        let color;
        if (isBreak) {
          color = "rgba(255, 200, 120, 0.8)";
        } else if (isSimultaneous) {
          color = "rgba(255, 245, 150, 0.8)";
        } else if (this.context.config.pinkSlideStart) {
          color = "rgba(255, 180, 210, 0.8)";
        } else {
          color = "rgba(100, 230, 230, 0.8)";
        }
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? outerRadius : outerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        for (let i2 = 9; i2 >= 0; i2--) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerRadius : innerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 9) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      });
    }
    // 渲染 Split 形态 EX 星头的外层发光光环（两个交错发光星环叠加）
    renderExSplitStarRing(x2, y2, size, isBreak = false, isSimultaneous = false, scaleFactor = 1) {
      this.withContext(() => {
        const ctx = this.context.ctx;
        const scale = 1.19 * scaleFactor;
        const outerRadius = size * scale;
        const outerInner = size * 0.5 * scale;
        const innerRadius = size;
        const innerInner = size * 0.5;
        let color;
        if (isBreak) {
          color = "rgba(255, 200, 120, 0.8)";
        } else if (isSimultaneous) {
          color = "rgba(255, 245, 150, 0.8)";
        } else if (this.context.config.pinkSlideStart) {
          color = "rgba(255, 180, 210, 0.8)";
        } else {
          color = "rgba(100, 230, 230, 0.8)";
        }
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? outerRadius : outerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        for (let i2 = 9; i2 >= 0; i2--) {
          const angle = i2 * Math.PI / 5 - Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerRadius : innerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 9) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 + Math.PI / 2;
          const radius = i2 % 2 === 0 ? outerRadius : outerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        for (let i2 = 9; i2 >= 0; i2--) {
          const angle = i2 * Math.PI / 5 + Math.PI / 2;
          const radius = i2 % 2 === 0 ? innerRadius : innerInner;
          const px = x2 + Math.cos(angle) * radius;
          const py = y2 + Math.sin(angle) * radius;
          if (i2 === 9) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      });
    }
    /**
     * 计算星头自转角（自登场起持续生效，顺时针为负）。
     * 旋转速度正比于路径规整长度与持续时长，上限 MAX_ROTATION_DEG_PER_MS = 1.08 deg/ms。
     */
    calculateStarRotation(note, currentTimeMs) {
      const durationMs = note.allDurationMs ? note.allDurationMs[0] : note.durationMs;
      const segments = note.allSlideSegments ? note.allSlideSegments[0] : note.slideSegments;
      if (!segments || segments.length === 0 || !durationMs || durationMs === 0) return 0;
      let totalLengthPixels = 0;
      for (const seg of segments) {
        totalLengthPixels += this.getSegmentLength(seg);
      }
      const normalizedLength = totalLengthPixels * (PANEL_RADIUS_UNITS / this.context.radius);
      const rotationSpeedDegPerMs = normalizedLength / Math.PI / durationMs * 15 * 0.06;
      const MAX_ROTATION_DEG_PER_MS = 1.08;
      const cappedRotationDegPerMs = Math.min(rotationSpeedDegPerMs, MAX_ROTATION_DEG_PER_MS);
      const rotationSpeedRadPerMs = -cappedRotationDegPerMs * (Math.PI / 180);
      const approachTime = this.getNoteApproachTimeMs(note);
      const visibilityStart = note.timingMs - approachTime;
      if (currentTimeMs < visibilityStart) return 0;
      const elapsedMs = currentTimeMs - visibilityStart;
      return rotationSpeedRadPerMs * elapsedMs;
    }
    // 获取分段实际弧长（像素），优先取缓存，未命中时查 LUT 末点弧长
    getSegmentLength(segment) {
      if (segment.cachedLength !== void 0 && segment.cachedRadius === this.context.radius && segment.cachedMirrorMode === this.context.config.mirrorMode) {
        return segment.cachedLength;
      }
      const lut = this.getSegmentLut(segment);
      return lut[lut.length - 1].s;
    }
    // 采样单段 Slide 在参数 t 处的坐标。首尾补按键圆心，保证连续拼接时星头平滑过渡
    getPointOnSegment(segment, t2) {
      const chain = this.getBarChain(segment);
      if (chain && chain.length >= 2) {
        const start2 = this.noteRenderer.getPositionOnRing(segment.startPos);
        const end2 = this.noteRenderer.getPositionOnRing(segment.endPos);
        const N2 = chain.length + 2;
        const idx = Math.max(0, Math.min(N2 - 1, t2 * (N2 - 1)));
        const intBase = Math.min(N2 - 2, Math.floor(idx));
        const frac = idx - intBase;
        const get = (i2) => i2 === 0 ? start2 : i2 === N2 - 1 ? end2 : chain[i2 - 1];
        const p0 = get(intBase);
        const p1 = get(intBase + 1);
        return {
          x: p0.x + (p1.x - p0.x) * frac,
          y: p0.y + (p1.y - p0.y) * frac
        };
      }
      const start = this.noteRenderer.getPositionOnRing(segment.startPos);
      const end = this.noteRenderer.getPositionOnRing(segment.endPos);
      return {
        x: start.x + (end.x - start.x) * t2,
        y: start.y + (end.y - start.y) * t2
      };
    }
    // 根据复合路径全局滑动进度插值星头坐标
    getPointAlongPath(progress, segments) {
      if (!segments || segments.length === 0) {
        return { x: this.context.centerX, y: this.context.centerY };
      }
      const luts = segments.map((seg) => this.getSegmentLut(seg));
      const lengths = luts.map((lut) => lut[lut.length - 1].s);
      const totalLength = lengths.reduce((a2, b2) => a2 + b2, 0);
      if (totalLength === 0) {
        return this.noteRenderer.getPositionOnRing(segments[0].startPos);
      }
      const targetDist = progress * totalLength;
      let cumulative = 0;
      for (let i2 = 0; i2 < segments.length; i2++) {
        if (cumulative + lengths[i2] >= targetDist) {
          const p2 = this.sampleArcLut(luts[i2], targetDist - cumulative);
          return { x: p2.x, y: p2.y };
        }
        cumulative += lengths[i2];
      }
      const lastSeg = segments[segments.length - 1];
      return this.noteRenderer.getPositionOnRing(lastSeg.endPos);
    }
    // 根据复合路径滑动进度计算星头运动切向角（朝向）
    getPathTangentAngle(progress, segments) {
      if (!segments || segments.length === 0) return 0;
      let total = 0;
      const zs = [];
      const angles = [];
      for (const seg of segments) {
        const chain = this.getBarChain(seg);
        if (!chain || chain.length === 0) continue;
        const start = this.noteRenderer.getPositionOnRing(seg.startPos);
        const end = this.noteRenderer.getPositionOnRing(seg.endPos);
        const last = chain.length - 1;
        const poly = [
          { x: start.x, y: start.y, angle: chain[0].angle },
          ...chain,
          { x: end.x, y: end.y, angle: chain[last].angle }
        ];
        let prev = null;
        for (const p2 of poly) {
          if (prev) total += Math.hypot(p2.x - prev.x, p2.y - prev.y);
          zs.push(total);
          angles.push(p2.angle);
          prev = p2;
        }
      }
      if (angles.length === 0) return 0;
      if (angles.length === 1) return angles[0];
      const target = Math.max(0, Math.min(1, progress)) * total;
      for (let i2 = 0; i2 < zs.length - 1; i2++) {
        if (zs[i2] <= target && target <= zs[i2 + 1]) {
          const span = zs[i2 + 1] - zs[i2];
          return this.lerpAngle(angles[i2], angles[i2 + 1], span > 0 ? (target - zs[i2]) / span : 0);
        }
      }
      return angles[angles.length - 1];
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/HoldRenderer.ts
  function activeBodyBrightness(elapsedMs) {
    if (elapsedMs < 0) return 1;
    const steps = HOLD_ACTIVE_BRIGHTNESS_CURVE.length;
    const position = elapsedMs % HOLD_ACTIVE_CYCLE_MS / HOLD_ACTIVE_CYCLE_MS * steps;
    const index = Math.floor(position);
    const t2 = position - index;
    const a2 = HOLD_ACTIVE_BRIGHTNESS_CURVE[index % steps];
    const b2 = HOLD_ACTIVE_BRIGHTNESS_CURVE[(index + 1) % steps];
    return HOLD_ACTIVE_BRIGHTNESS_MIN + (a2 + (b2 - a2) * t2) * (HOLD_ACTIVE_BRIGHTNESS_MAX - HOLD_ACTIVE_BRIGHTNESS_MIN);
  }
  var HoldRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
    }
    /**
     * 渲染单个 Hold（含本体、内外描边、EX 外框、头部发光及按压呼吸）。
     * 在独立的 Canvas 上下文中绘制。尾端未进视野时以登场起点作临时尾端；
     * startNote/endNote 传 null 时跳过展开动画与按压判定。
     */
    renderHold(startPosition, endPosition, buttonPosition, color, isEx = false, startNote = null, endNote = null, currentTimeMs = 0, isBreakHold = false, isSimultaneous = false, exScaleFactor = 1) {
      const angle = this.getButtonAngle(buttonPosition);
      const baseSize = this.scaleByRadius(NOTE_SIZE_RATIO) * HOLD_WIDTH_RATIO;
      const holdWidth = baseSize * startPosition.scale;
      const startX = startPosition.x;
      const startY = startPosition.y;
      let endX;
      let endY;
      if (endPosition.visible) {
        endX = endPosition.x;
        endY = endPosition.y;
      } else {
        const dir = startNote ? this.getNoteApproachDir(startNote) : 1;
        const approachDist = (1 + dir * -0.75) * this.context.radius;
        endX = this.context.centerX + Math.cos(angle) * approachDist;
        endY = this.context.centerY + Math.sin(angle) * approachDist;
      }
      const tipAngle = angle;
      const leftAngle = angle + Math.PI / 3;
      const rightAngle = angle - Math.PI / 3;
      const backAngle = angle + Math.PI;
      const backLeftAngle = angle + Math.PI - Math.PI / 3;
      const backRightAngle = angle + Math.PI + Math.PI / 3;
      const startTip = {
        x: startX + Math.cos(tipAngle) * holdWidth,
        y: startY + Math.sin(tipAngle) * holdWidth
      };
      const startLeft = {
        x: startX + Math.cos(leftAngle) * holdWidth,
        y: startY + Math.sin(leftAngle) * holdWidth
      };
      const startRight = {
        x: startX + Math.cos(rightAngle) * holdWidth,
        y: startY + Math.sin(rightAngle) * holdWidth
      };
      let endScale = 1;
      if (startNote && endNote && currentTimeMs) {
        const approachHalf = this.getNoteApproachTimeMs(startNote) / 2;
        const timeDiff = startNote.timingMs - currentTimeMs;
        if (timeDiff > approachHalf) {
          endScale = Math.max(0, 1 - (timeDiff - approachHalf) / approachHalf);
        }
      }
      const endWidth = baseSize * endScale;
      const endBack = {
        x: endX + Math.cos(backAngle) * endWidth,
        y: endY + Math.sin(backAngle) * endWidth
      };
      const endBackLeft = {
        x: endX + Math.cos(backLeftAngle) * endWidth,
        y: endY + Math.sin(backLeftAngle) * endWidth
      };
      const endBackRight = {
        x: endX + Math.cos(backRightAngle) * endWidth,
        y: endY + Math.sin(backRightAngle) * endWidth
      };
      const innerRatio = HOLD_INNER_RATIO;
      const innerStartTip = {
        x: startX + Math.cos(tipAngle) * holdWidth * innerRatio,
        y: startY + Math.sin(tipAngle) * holdWidth * innerRatio
      };
      const innerStartLeft = {
        x: startX + Math.cos(leftAngle) * holdWidth * innerRatio,
        y: startY + Math.sin(leftAngle) * holdWidth * innerRatio
      };
      const innerStartRight = {
        x: startX + Math.cos(rightAngle) * holdWidth * innerRatio,
        y: startY + Math.sin(rightAngle) * holdWidth * innerRatio
      };
      const innerEndBack = {
        x: endX + Math.cos(backAngle) * endWidth * innerRatio,
        y: endY + Math.sin(backAngle) * endWidth * innerRatio
      };
      const innerEndBackLeft = {
        x: endX + Math.cos(backLeftAngle) * endWidth * innerRatio,
        y: endY + Math.sin(backLeftAngle) * endWidth * innerRatio
      };
      const innerEndBackRight = {
        x: endX + Math.cos(backRightAngle) * endWidth * innerRatio,
        y: endY + Math.sin(backRightAngle) * endWidth * innerRatio
      };
      this.withContext(() => {
        const ctx = this.context.ctx;
        if (isEx) {
          const exScale = 1.19 * exScaleFactor;
          let exColor;
          if (isBreakHold) {
            exColor = COLORS.EX_OVERLAY_BREAK;
          } else if (isSimultaneous) {
            exColor = COLORS.EX_OVERLAY_SIMULTANEOUS;
          } else {
            exColor = COLORS.EX_OVERLAY_NORMAL;
          }
          const exStartTip = this.scalePoint(startX, startY, startTip, exScale);
          const exStartLeft = this.scalePoint(startX, startY, startLeft, exScale);
          const exStartRight = this.scalePoint(startX, startY, startRight, exScale);
          const exEndBack = this.scalePoint(endX, endY, endBack, exScale);
          const exEndBackLeft = this.scalePoint(endX, endY, endBackLeft, exScale);
          const exEndBackRight = this.scalePoint(endX, endY, endBackRight, exScale);
          ctx.beginPath();
          ctx.moveTo(exStartTip.x, exStartTip.y);
          ctx.lineTo(exStartLeft.x, exStartLeft.y);
          ctx.lineTo(exEndBackLeft.x, exEndBackLeft.y);
          ctx.lineTo(exEndBack.x, exEndBack.y);
          ctx.lineTo(exEndBackRight.x, exEndBackRight.y);
          ctx.lineTo(exStartRight.x, exStartRight.y);
          ctx.closePath();
          ctx.moveTo(startTip.x, startTip.y);
          ctx.lineTo(startRight.x, startRight.y);
          ctx.lineTo(endBackRight.x, endBackRight.y);
          ctx.lineTo(endBack.x, endBack.y);
          ctx.lineTo(endBackLeft.x, endBackLeft.y);
          ctx.lineTo(startLeft.x, startLeft.y);
          ctx.closePath();
          ctx.fillStyle = exColor;
          ctx.fill();
        }
        const isPressed = startNote !== null && endNote !== null && currentTimeMs >= startNote.timingMs && currentTimeMs < endNote.timingMs;
        const brightness = isPressed ? activeBodyBrightness(currentTimeMs - startNote.timingMs) : 1;
        const tint = (hex) => brightness === 1 ? hex : this.scaleHexBrightness(hex, brightness);
        const outlineColor = tint(COLORS.WHITE);
        const strokeWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
        if (!isEx) {
          ctx.beginPath();
          ctx.moveTo(startTip.x, startTip.y);
          ctx.lineTo(startLeft.x, startLeft.y);
          ctx.lineTo(endBackLeft.x, endBackLeft.y);
          ctx.lineTo(endBack.x, endBack.y);
          ctx.lineTo(endBackRight.x, endBackRight.y);
          ctx.lineTo(startRight.x, startRight.y);
          ctx.closePath();
          this.stroke(COLORS.BLACK, strokeWidth * 3);
        }
        ctx.beginPath();
        ctx.moveTo(innerStartTip.x, innerStartTip.y);
        ctx.lineTo(innerStartLeft.x, innerStartLeft.y);
        ctx.lineTo(innerEndBackLeft.x, innerEndBackLeft.y);
        ctx.lineTo(innerEndBack.x, innerEndBack.y);
        ctx.lineTo(innerEndBackRight.x, innerEndBackRight.y);
        ctx.lineTo(innerStartRight.x, innerStartRight.y);
        ctx.closePath();
        this.stroke(COLORS.BLACK, strokeWidth * 3);
        const lightColor = tint(this.mixHexColor(color[0], "#ffffff", NOTE_LIGHTEN_RATIO));
        const bodyColor = tint(color[1]);
        const segments = [
          { os: startTip, oe: startLeft, is: innerStartTip, ie: innerStartLeft },
          { os: startLeft, oe: endBackLeft, is: innerStartLeft, ie: innerEndBackLeft },
          { os: endBackLeft, oe: endBack, is: innerEndBackLeft, ie: innerEndBack },
          { os: endBack, oe: endBackRight, is: innerEndBack, ie: innerEndBackRight },
          { os: endBackRight, oe: startRight, is: innerEndBackRight, ie: innerStartRight },
          { os: startRight, oe: startTip, is: innerStartRight, ie: innerStartTip }
        ];
        for (const { os, oe, is: innerS, ie: innerE } of segments) {
          const gradient = ctx.createLinearGradient(os.x, os.y, oe.x, oe.y);
          gradient.addColorStop(0, lightColor);
          gradient.addColorStop(1, bodyColor);
          ctx.beginPath();
          ctx.moveTo(os.x, os.y);
          ctx.lineTo(oe.x, oe.y);
          ctx.lineTo(innerE.x, innerE.y);
          ctx.lineTo(innerS.x, innerS.y);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(startTip.x, startTip.y);
        ctx.lineTo(startLeft.x, startLeft.y);
        ctx.lineTo(endBackLeft.x, endBackLeft.y);
        ctx.lineTo(endBack.x, endBack.y);
        ctx.lineTo(endBackRight.x, endBackRight.y);
        ctx.lineTo(startRight.x, startRight.y);
        ctx.closePath();
        this.stroke(outlineColor, strokeWidth);
        ctx.beginPath();
        ctx.moveTo(innerStartTip.x, innerStartTip.y);
        ctx.lineTo(innerStartLeft.x, innerStartLeft.y);
        ctx.lineTo(innerEndBackLeft.x, innerEndBackLeft.y);
        ctx.lineTo(innerEndBack.x, innerEndBack.y);
        ctx.lineTo(innerEndBackRight.x, innerEndBackRight.y);
        ctx.lineTo(innerStartRight.x, innerStartRight.y);
        ctx.closePath();
        this.stroke(outlineColor, strokeWidth);
        if (isPressed) {
          this.drawActiveHeadGlow(startX, startY, color[0]);
        } else {
          const centerSize = holdWidth * 0.15;
          ctx.beginPath();
          ctx.arc(startX, startY, centerSize, 0, Math.PI * 2);
          ctx.fillStyle = color[0];
          ctx.fill();
        }
        if (endPosition.visible && endNote && currentTimeMs) {
          const approachHalf = this.getNoteApproachTimeMs(endNote) / 2;
          const endTimeDiff = endNote.timingMs - currentTimeMs;
          if (endTimeDiff <= approachHalf) {
            const endCenterSize = endWidth * 0.15;
            ctx.beginPath();
            ctx.arc(endX, endY, endCenterSize, 0, Math.PI * 2);
            ctx.fillStyle = tint(color[0]);
            ctx.fill();
          }
        }
      });
    }
    /**
     * 绘制 Hold 按压时的头部径向渐变辉光。
     * 亮度保持恒定，不随本体呼吸；外径 < 1px 时跳过。
     */
    drawActiveHeadGlow(x2, y2, noteColor) {
      const outer = this.scaleByRadius(HOLD_ACTIVE_GLOW_RATIO);
      if (outer < 1) return;
      const base = [1, 3, 5].map((i2) => Number.parseInt(noteColor.slice(i2, i2 + 2), 16));
      const ctx = this.context.ctx;
      const gradient = ctx.createRadialGradient(x2, y2, 0, x2, y2, outer);
      for (const [stop, mr, mg, mb] of HOLD_ACTIVE_GLOW_RAMP) {
        const ch = (value, mul) => Math.max(0, Math.min(255, Math.round(value * mul)));
        gradient.addColorStop(stop, `rgb(${ch(base[0], mr)},${ch(base[1], mg)},${ch(base[2], mb)})`);
      }
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(x2, y2, outer, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    scalePoint(centerX, centerY, point, scale) {
      return {
        x: centerX + (point.x - centerX) * scale,
        y: centerY + (point.y - centerY) * scale
      };
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/utils/drawGroupSort.ts
  function drawGroupKey(layer, order) {
    return (layer + 32768 << 16 | order + 32768 & 65535) >>> 0;
  }
  function sortDrawGroup(items) {
    const swap = (a2, b2) => {
      const value = items[a2];
      items[a2] = items[b2];
      items[b2] = value;
    };
    const sortThree = (a2, b2, c2) => {
      if (items[b2].key < items[a2].key) swap(a2, b2);
      if (items[c2].key < items[b2].key) swap(b2, c2);
      if (items[b2].key < items[a2].key) swap(a2, b2);
    };
    const heapSort = (first, count) => {
      const adjust = (hole, length, value) => {
        const top = hole;
        let child = hole * 2 + 2;
        while (child < length) {
          if (items[first + child].key < items[first + child - 1].key) child--;
          items[first + hole] = items[first + child];
          hole = child;
          child = hole * 2 + 2;
        }
        if (child === length) {
          items[first + hole] = items[first + child - 1];
          hole = child - 1;
        }
        let parent = Math.floor((hole - 1) / 2);
        while (hole > top && items[first + parent].key < value.key) {
          items[first + hole] = items[first + parent];
          hole = parent;
          parent = Math.floor((hole - 1) / 2);
        }
        items[first + hole] = value;
      };
      for (let parent = Math.floor(count / 2) - 1; parent >= 0; parent--) {
        adjust(parent, count, items[first + parent]);
      }
      while (count > 1) {
        const value = items[first + --count];
        items[first + count] = items[first];
        adjust(0, count, value);
      }
    };
    const sort = (first, end, ideal) => {
      while (end - first >= 32) {
        if (ideal <= 0) {
          heapSort(first, end - first);
          return;
        }
        const last = end - 1;
        const middle = first + Math.floor((last - first) / 2);
        if (last - first > 64) {
          const step = Math.floor((last - first) / 8);
          sortThree(first, first + step, first + 2 * step);
          sortThree(middle - step, middle, middle + step);
          sortThree(last - 2 * step, last - step, last);
          sortThree(first + step, middle, last - step);
        } else {
          sortThree(first, middle, last);
        }
        swap(middle, last);
        const pivot = items[last].key;
        let i2 = first - 1;
        let j2 = last;
        let p2 = first - 1;
        let q = last;
        for (; ; ) {
          do
            i2++;
          while (items[i2].key < pivot && i2 !== last);
          do
            j2--;
          while (pivot < items[j2].key && j2 !== first);
          if (i2 >= j2) break;
          swap(i2, j2);
          if (items[i2].key === pivot) swap(++p2, i2);
          if (items[j2].key === pivot) swap(--q, j2);
        }
        swap(i2, last);
        let leftEnd = i2 - 1;
        let rightStart = i2 + 1;
        for (let k2 = first; k2 < p2; k2++) swap(k2, leftEnd--);
        for (let k2 = last - 1; k2 > q; k2--) swap(k2, rightStart++);
        const halfIdeal = Math.floor(ideal / 2);
        ideal = halfIdeal + Math.floor(halfIdeal / 2);
        const leftSize = leftEnd + 1 - first;
        const rightSize = end - rightStart;
        if (leftSize < rightSize) {
          sort(first, leftEnd + 1, leftSize);
          first = rightStart;
        } else {
          sort(rightStart, end, rightSize);
          end = leftEnd + 1;
        }
      }
      for (let i2 = first + 1; i2 < end; i2++) {
        for (let j2 = i2; j2 > first && items[j2].key < items[j2 - 1].key; j2--) swap(j2, j2 - 1);
      }
    };
    sort(0, items.length, items.length);
  }

  // ../adx-dl/packages/maimai-chart-engine/src/utils/touchDrawOrder.ts
  var TOUCH_LAYERS = ["B", "E", "A", "D", "C"];
  var DEFAULT_LAUNCHER_KEYS = [
    2148237322,
    2148237312,
    2148237312,
    2147844096,
    2147844096,
    2147844098,
    2147844098,
    2147844096,
    2147844096,
    2147844096,
    2147844098,
    2147844098,
    2147844096,
    2147844096,
    2147844096,
    2147844096,
    2147844098,
    2147844098,
    2147844096,
    2147844106,
    2147844096,
    2147844096,
    2147844096,
    2147844096,
    2147844096,
    2147844096,
    2147844096,
    2147942399,
    2147942399,
    2147516416,
    2147516416
  ];
  function appendNoteElements(elements, note) {
    const layer = note.isHold ? 4 : 3;
    const add = (offset, part, sortingLayer = layer) => {
      elements.push({
        key: drawGroupKey(sortingLayer, -note.sourceIndex + offset),
        sourceIndex: note.sourceIndex,
        part
      });
    };
    add(3, "center");
    add(2, "petal-0");
    add(note.isHold ? 2 : 1, "petal-1");
    add(note.isHold ? 1 : 2, "petal-2");
    add(1, "petal-3");
    if (!note.isHold) add(4);
    add(2, void 0, 5);
    if (note.isHold) add(-1, "gauge");
  }
  var TouchDrawOrder = class {
    constructor() {
      this.signature = "";
      this.parts = [];
    }
    resolve(notes) {
      const ordered = [...notes].sort(
        (a2, b2) => (a2.position[0] === "C" && b2.position[0] === "C" ? 0 : a2.position < b2.position ? -1 : a2.position > b2.position ? 1 : 0) || b2.registeredAtMs - a2.registeredAtMs || b2.sourceIndex - a2.sourceIndex
      );
      const signature = ordered.map((note) => [note.position, note.sourceIndex, Number(note.isHold)].join(":")).join("|");
      if (signature === this.signature) return this.parts;
      const parts = [];
      for (const layer of TOUCH_LAYERS) {
        const group = ordered.filter((note) => note.position[0] === layer);
        if (!group.length) continue;
        const elements = [{ key: 0 }, { key: 4294967295 }];
        for (let sensor = 1; sensor <= (layer === "C" ? 1 : 8); sensor++) {
          for (const note of group) {
            if (layer === "C" || Number(note.position[1]) === sensor)
              appendNoteElements(elements, note);
          }
          for (const key of DEFAULT_LAUNCHER_KEYS) elements.push({ key });
        }
        sortDrawGroup(elements);
        for (let i2 = 0; i2 < elements.length; i2++) {
          const { sourceIndex, part } = elements[i2];
          if (sourceIndex !== void 0 && part !== void 0)
            parts.push({ sourceIndex, part, groupOrder: i2 + 1 });
        }
      }
      this.signature = signature;
      this.parts = parts;
      return parts;
    }
  };
  function flushTouchDrawCommands(queue, order = new TouchDrawOrder()) {
    const commands = new Map(queue.map((command) => [command.sourceIndex, command]));
    for (const { sourceIndex, part } of order.resolve(queue)) commands.get(sourceIndex).draw(part);
  }

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/TouchRenderer.ts
  var PETAL_CORNER_RATIO = 8 / 300;
  var PETAL_SHADOW_BLUR_RATIO = 8 / 300;
  var PETAL_SHADOW_OFFSET_RATIO = 2 / 300;
  var TOUCH_HOLD_PETAL_PALETTES = [
    ["#FF5511", COLORS.TOUCH_HOLD_RED, "#E74201", "#FFF6F2"],
    ["#F8DE00", COLORS.TOUCH_HOLD_YELLOW, "#ECF402", "#FFFBEF"],
    ["#1EB476", COLORS.TOUCH_HOLD_GREEN, "#0AA062", "#ECFFF8"],
    ["#00AAF8", COLORS.TOUCH_HOLD_BLUE, "#0289F4", "#EFFCFF"]
  ];
  var TOUCH_HOLD_PROGRESS_COLORS = ["#E95513", "#FAED00", "#0DAC67", "#2CA6E0"];
  var TOUCH_HOLD_PROGRESS_GEOMETRY = {
    canvasHalf: 99.75,
    innerAxis: 64,
    innerDiagonal: 50.5,
    outerAxis: 97.75,
    outerDiagonal: 82.75
  };
  var TouchRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
      // Touch 花瓣贴图缓存（键: "图层|变体|花瓣索引"）
      this.touchPetalSprites = /* @__PURE__ */ new Map();
      this.touchSpriteBasis = "";
      this.touchHoldProgressSprite = null;
      this.touchHoldProgressBasis = "";
    }
    /** 花瓣贴图逻辑半宽（包含本体尺寸、外层描边与阴影余量）。 */
    getTouchSpriteHalf() {
      return this.scaleByRadius(TOUCH_PETAL_CLOSED_RATIO) * 1.3 + this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO) * 3 + this.scaleByRadius(PETAL_SHADOW_BLUR_RATIO) + this.scaleByRadius(PETAL_SHADOW_OFFSET_RATIO);
    }
    /**
     * 获取或烘焙单片 Touch 花瓣离屏贴图。
     * - layer: "sb"=阴影与黑边, "f"=色块填充, "w"=白色轮廓；
     * - kind: "n"=普通, "s"=双押, "h"=Touch Hold；
     * - i: 花瓣索引（0~3）。
     */
    getTouchPetalSprite(layer, kind, i2) {
      const backingScale = this.getBackingScale();
      const basis = `${this.context.radius}|${backingScale}`;
      if (this.touchSpriteBasis !== basis) {
        this.touchPetalSprites.clear();
        this.touchSpriteBasis = basis;
      }
      const geomKind = layer === "f" ? kind : kind === "h" ? "h" : "n";
      const key = `${layer}|${geomKind}|${i2}`;
      let sprite = this.touchPetalSprites.get(key);
      if (sprite) return sprite;
      const half = this.getTouchSpriteHalf();
      const sizePx = Math.max(2, Math.ceil(half * 2 * backingScale));
      sprite = document.createElement("canvas");
      sprite.width = sizePx;
      sprite.height = sizePx;
      const sctx = sprite.getContext("2d");
      sctx.setTransform(backingScale, 0, 0, backingScale, sizePx / 2, sizePx / 2);
      const isHold = geomKind === "h";
      const petalBaseAngles = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
      const petalAngle = petalBaseAngles[i2] + (isHold ? 0 : -Math.PI / 4);
      const petalSize = this.scaleByRadius(TOUCH_PETAL_CLOSED_RATIO) * 1.3;
      const tipAngle = petalAngle + Math.PI;
      const leftAngle = petalAngle + Math.PI / 2;
      const rightAngle = petalAngle - Math.PI / 2;
      const tipX = Math.cos(tipAngle) * petalSize;
      const tipY = Math.sin(tipAngle) * petalSize;
      const leftX = Math.cos(leftAngle) * petalSize;
      const leftY = Math.sin(leftAngle) * petalSize;
      const rightX = Math.cos(rightAngle) * petalSize;
      const rightY = Math.sin(rightAngle) * petalSize;
      const innerRatio = 0.4;
      const cx = (tipX + leftX + rightX) / 3;
      const cy = (tipY + leftY + rightY) / 3;
      const innerTipX = cx + (tipX - cx) * innerRatio;
      const innerTipY = cy + (tipY - cy) * innerRatio;
      const innerLeftX = cx + (leftX - cx) * innerRatio;
      const innerLeftY = cy + (leftY - cy) * innerRatio;
      const innerRightX = cx + (rightX - cx) * innerRatio;
      const innerRightY = cy + (rightY - cy) * innerRatio;
      const cornerRadius = this.scaleByRadius(PETAL_CORNER_RATIO);
      const innerCornerRadius = cornerRadius * 0.4;
      const strokeWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
      const mainCtx = this.context.ctx;
      this.context.ctx = sctx;
      try {
        if (layer === "sb") {
          sctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          sctx.shadowBlur = this.scaleByRadius(PETAL_SHADOW_BLUR_RATIO);
          sctx.shadowOffsetX = this.scaleByRadius(PETAL_SHADOW_OFFSET_RATIO);
          sctx.shadowOffsetY = this.scaleByRadius(PETAL_SHADOW_OFFSET_RATIO);
          sctx.fillStyle = "rgba(0, 0, 0, 0.01)";
          sctx.beginPath();
          this.drawRoundedTriangle(tipX, tipY, leftX, leftY, rightX, rightY, cornerRadius);
          sctx.fill();
          sctx.shadowColor = "transparent";
          sctx.shadowBlur = 0;
          sctx.shadowOffsetX = 0;
          sctx.shadowOffsetY = 0;
          sctx.beginPath();
          this.drawRoundedTriangle(tipX, tipY, leftX, leftY, rightX, rightY, cornerRadius);
          this.stroke(COLORS.BLACK, strokeWidth * 3);
          if (!isHold) {
            sctx.beginPath();
            this.drawRoundedTriangle(
              innerTipX,
              innerTipY,
              innerLeftX,
              innerLeftY,
              innerRightX,
              innerRightY,
              innerCornerRadius
            );
            this.stroke(COLORS.BLACK, strokeWidth * 3);
          }
        } else if (layer === "f") {
          let fillStyle;
          if (kind === "h") {
            fillStyle = this.createTouchHoldPetalGradient(
              sctx,
              TOUCH_HOLD_PETAL_PALETTES[i2],
              0,
              0,
              tipX,
              tipY
            );
          } else {
            const gradient = sctx.createLinearGradient(0, 0, tipX, tipY);
            const isEach = kind === "s";
            gradient.addColorStop(0, isEach ? COLORS.TOUCH_SIMULTANEOUS_YELLOW : COLORS.TOUCH_CYAN);
            gradient.addColorStop(1, isEach ? COLORS.SIMULTANEOUS_GOLD : COLORS.TOUCH_BLUE);
            fillStyle = gradient;
          }
          sctx.beginPath();
          this.drawRoundedTriangle(tipX, tipY, leftX, leftY, rightX, rightY, cornerRadius);
          if (!isHold) {
            this.drawRoundedTriangle(
              innerTipX,
              innerTipY,
              innerRightX,
              innerRightY,
              innerLeftX,
              innerLeftY,
              innerCornerRadius
            );
          }
          sctx.fillStyle = fillStyle;
          sctx.fill();
        } else {
          sctx.beginPath();
          this.drawRoundedTriangle(tipX, tipY, leftX, leftY, rightX, rightY, cornerRadius);
          if (!isHold) {
            this.drawRoundedTriangle(
              innerTipX,
              innerTipY,
              innerLeftX,
              innerLeftY,
              innerRightX,
              innerRightY,
              innerCornerRadius
            );
          }
          this.stroke(COLORS.WHITE, strokeWidth);
        }
      } finally {
        this.context.ctx = mainCtx;
      }
      this.touchPetalSprites.set(key, sprite);
      return sprite;
    }
    createTouchHoldPetalGradient(ctx, colors, baseX, baseY, tipX, tipY) {
      const gradient = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.35, colors[1]);
      gradient.addColorStop(0.72, colors[2]);
      gradient.addColorStop(1, colors[3]);
      return gradient;
    }
    getTouchHoldProgressHalf() {
      return this.context.radius / PANEL_RADIUS_UNITS * TOUCH_HOLD_PROGRESS_GEOMETRY.canvasHalf;
    }
    getTouchHoldProgressSprite() {
      const backingScale = this.getBackingScale();
      const basis = `${this.context.radius}|${backingScale}`;
      if (this.touchHoldProgressSprite && this.touchHoldProgressBasis === basis) {
        return this.touchHoldProgressSprite;
      }
      const half = this.getTouchHoldProgressHalf();
      const unit = this.context.radius / PANEL_RADIUS_UNITS;
      const sprite = document.createElement("canvas");
      const sizePx = Math.max(2, Math.ceil(half * 2 * backingScale));
      sprite.width = sizePx;
      sprite.height = sizePx;
      const ctx = sprite.getContext("2d");
      const scale = sizePx / (half * 2);
      ctx.setTransform(scale, 0, 0, scale, sizePx / 2, sizePx / 2);
      const roundedDiamond = (axisRadius, diagonalRadius) => {
        const radius = diagonalRadius * Math.SQRT2 * unit;
        const offset = 2 * (radius - axisRadius * unit);
        const path = new Path2D();
        path.moveTo(-offset, -radius + offset);
        path.quadraticCurveTo(0, -radius, offset, -radius + offset);
        path.lineTo(radius - offset, -offset);
        path.quadraticCurveTo(radius, 0, radius - offset, offset);
        path.lineTo(offset, radius - offset);
        path.quadraticCurveTo(0, radius, -offset, radius - offset);
        path.lineTo(-radius + offset, offset);
        path.quadraticCurveTo(-radius, 0, -radius + offset, -offset);
        path.closePath();
        return path;
      };
      const ring = roundedDiamond(
        TOUCH_HOLD_PROGRESS_GEOMETRY.outerAxis,
        TOUCH_HOLD_PROGRESS_GEOMETRY.outerDiagonal
      );
      ring.addPath(
        roundedDiamond(
          TOUCH_HOLD_PROGRESS_GEOMETRY.innerAxis,
          TOUCH_HOLD_PROGRESS_GEOMETRY.innerDiagonal
        )
      );
      ctx.clip(ring, "evenodd");
      for (let i2 = 0; i2 < 4; i2++) {
        const angle = -Math.PI / 4 + i2 * Math.PI / 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const gradient = ctx.createLinearGradient(
          dx * TOUCH_HOLD_PROGRESS_GEOMETRY.innerDiagonal * unit,
          dy * TOUCH_HOLD_PROGRESS_GEOMETRY.innerDiagonal * unit,
          dx * TOUCH_HOLD_PROGRESS_GEOMETRY.outerDiagonal * unit,
          dy * TOUCH_HOLD_PROGRESS_GEOMETRY.outerDiagonal * unit
        );
        const color = TOUCH_HOLD_PROGRESS_COLORS[i2];
        gradient.addColorStop(0, mixHexColor(color, COLORS.BLACK, 0.28));
        gradient.addColorStop(0.35, color);
        gradient.addColorStop(0.72, mixHexColor(color, COLORS.WHITE, 0.32));
        gradient.addColorStop(1, mixHexColor(color, COLORS.WHITE, 0.08));
        ctx.fillStyle = gradient;
        ctx.fillRect(dx > 0 ? 0 : -half, dy > 0 ? 0 : -half, half, half);
      }
      this.touchHoldProgressSprite = sprite;
      this.touchHoldProgressBasis = basis;
      return sprite;
    }
    getTouchApproachTimeMs(note) {
      return this.getNoteApproachTimeMs(note) * TOUCH_APPROACH_MULTIPLIER;
    }
    /** 渲染单个 Touch 或 Touch Hold 音符；同帧所有音符须共享 queue 并在收集完后 flush 才能定出覆盖顺序。 */
    renderTouch(note, _currentBeat, currentTimeMs, isSimultaneous, queue, sourceIndex = queue?.length ?? 0) {
      const isHold = note.type === "touch-hold-start";
      const timeDiff = note.timingMs - currentTimeMs;
      const approachTime = this.getTouchApproachTimeMs(note);
      let visibilityWindow = 50;
      if (isHold && "durationMs" in note && note.durationMs !== void 0) {
        visibilityWindow = note.durationMs + 50;
      }
      if (timeDiff > approachTime || timeDiff < -visibilityWindow) return;
      let alpha = 1;
      if (timeDiff > approachTime * 0.95) {
        alpha = 1 - (timeDiff - approachTime * 0.95) / (approachTime * 0.05);
      }
      let petalAlpha = 1;
      if (timeDiff > 0 && timeDiff < approachTime) {
        const remaining = approachTime - timeDiff;
        if (remaining < 150) {
          petalAlpha = remaining / 150;
        }
      }
      const openDist = this.scaleByRadius(TOUCH_PETAL_OPEN_RATIO) * 1.1;
      const closedDist = this.scaleByRadius(TOUCH_PETAL_CLOSED_RATIO) * 1.3;
      let petalDist = openDist;
      if (timeDiff > 0 && timeDiff <= approachTime) {
        const progress = 1 - timeDiff / approachTime;
        const eased = progress * progress * progress * progress;
        petalDist = openDist - (openDist - closedDist) * eased;
      } else if (timeDiff <= 0) {
        petalDist = closedDist;
      }
      const position = this.getTouchPosition(note.position);
      const isHoldActive = isHold && timeDiff < 0;
      const ctx = this.context.ctx;
      const cornerRadius = this.scaleByRadius(PETAL_CORNER_RATIO);
      const innerCornerRadius = cornerRadius * 0.4;
      const strokeWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
      const ddrColor = this.getDdrColor(note.timing);
      const petalBaseAngles = [-Math.PI / 4, Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4];
      const angleOffset = isHold ? 0 : -Math.PI / 4;
      const combinedAlpha = alpha * petalAlpha;
      const petals = [];
      for (let i2 = 0; i2 < 4; i2++) {
        const petalAngle = petalBaseAngles[i2] + angleOffset;
        const petalX = position.x + Math.cos(petalAngle) * petalDist;
        const petalY = position.y + Math.sin(petalAngle) * petalDist;
        const tipAngle = petalAngle + Math.PI;
        const leftAngle = petalAngle + Math.PI / 2;
        const rightAngle = petalAngle - Math.PI / 2;
        const petalSize = closedDist;
        const tipX = petalX + Math.cos(tipAngle) * petalSize;
        const tipY = petalY + Math.sin(tipAngle) * petalSize;
        const leftX = petalX + Math.cos(leftAngle) * petalSize;
        const leftY = petalY + Math.sin(leftAngle) * petalSize;
        const rightX = petalX + Math.cos(rightAngle) * petalSize;
        const rightY = petalY + Math.sin(rightAngle) * petalSize;
        const petal = { tipX, tipY, leftX, leftY, rightX, rightY, petalX, petalY };
        if (!isHold) {
          const innerRatio = 0.4;
          const cx = (tipX + leftX + rightX) / 3;
          const cy = (tipY + leftY + rightY) / 3;
          petal.innerTipX = cx + (tipX - cx) * innerRatio;
          petal.innerTipY = cy + (tipY - cy) * innerRatio;
          petal.innerLeftX = cx + (leftX - cx) * innerRatio;
          petal.innerLeftY = cy + (leftY - cy) * innerRatio;
          petal.innerRightX = cx + (rightX - cx) * innerRatio;
          petal.innerRightY = cy + (rightY - cy) * innerRatio;
        }
        petals.push(petal);
      }
      const drawPart = (part) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        if (part === "gauge" && isHoldActive && "durationMs" in note && note.durationMs !== void 0) {
          const elapsed = -timeDiff;
          const progress = Math.min(elapsed / note.durationMs, 1);
          const half = this.getTouchHoldProgressHalf();
          const endAngle = -Math.PI / 2 + progress * Math.PI * 2;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(position.x, position.y);
          ctx.arc(position.x, position.y, half, -Math.PI / 2, endAngle, false);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            this.getTouchHoldProgressSprite(),
            position.x - half,
            position.y - half,
            half * 2,
            half * 2
          );
          ctx.restore();
        }
        ctx.globalAlpha = combinedAlpha;
        if (part.startsWith("petal-")) {
          const petalIndex = Number(part.slice(-1));
          const p2 = petals[petalIndex];
          if (ddrColor) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = this.scaleByRadius(PETAL_SHADOW_BLUR_RATIO);
            ctx.shadowOffsetX = this.scaleByRadius(PETAL_SHADOW_OFFSET_RATIO);
            ctx.shadowOffsetY = this.scaleByRadius(PETAL_SHADOW_OFFSET_RATIO);
            ctx.fillStyle = "rgba(0, 0, 0, 0.01)";
            ctx.beginPath();
            this.drawRoundedTriangle(
              p2.tipX,
              p2.tipY,
              p2.leftX,
              p2.leftY,
              p2.rightX,
              p2.rightY,
              cornerRadius
            );
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.beginPath();
            this.drawRoundedTriangle(
              p2.tipX,
              p2.tipY,
              p2.leftX,
              p2.leftY,
              p2.rightX,
              p2.rightY,
              cornerRadius
            );
            this.stroke(COLORS.BLACK, strokeWidth * 3);
            if (!isHold) {
              ctx.beginPath();
              this.drawRoundedTriangle(
                p2.innerTipX,
                p2.innerTipY,
                p2.innerLeftX,
                p2.innerLeftY,
                p2.innerRightX,
                p2.innerRightY,
                innerCornerRadius
              );
              this.stroke(COLORS.BLACK, strokeWidth * 3);
            }
            ctx.beginPath();
            this.drawRoundedTriangle(
              p2.tipX,
              p2.tipY,
              p2.leftX,
              p2.leftY,
              p2.rightX,
              p2.rightY,
              cornerRadius
            );
            if (!isHold) {
              this.drawRoundedTriangle(
                p2.innerTipX,
                p2.innerTipY,
                p2.innerRightX,
                p2.innerRightY,
                p2.innerLeftX,
                p2.innerLeftY,
                innerCornerRadius
              );
            }
            ctx.fillStyle = isHold ? this.createTouchHoldPetalGradient(
              ctx,
              [
                mixHexColor(ddrColor, COLORS.WHITE, 0.24),
                ddrColor,
                mixHexColor(ddrColor, COLORS.BLACK, 0.22),
                mixHexColor(ddrColor, COLORS.WHITE, 0.5)
              ],
              p2.petalX,
              p2.petalY,
              p2.tipX,
              p2.tipY
            ) : ddrColor;
            ctx.fill();
            ctx.beginPath();
            this.drawRoundedTriangle(
              p2.tipX,
              p2.tipY,
              p2.leftX,
              p2.leftY,
              p2.rightX,
              p2.rightY,
              cornerRadius
            );
            if (!isHold) {
              this.drawRoundedTriangle(
                p2.innerTipX,
                p2.innerTipY,
                p2.innerLeftX,
                p2.innerLeftY,
                p2.innerRightX,
                p2.innerRightY,
                innerCornerRadius
              );
            }
            this.stroke(COLORS.WHITE, strokeWidth);
          } else {
            const spriteKind = isHold ? "h" : isSimultaneous ? "s" : "n";
            const spriteHalf = this.getTouchSpriteHalf();
            for (const layer of ["sb", "f", "w"]) {
              ctx.drawImage(
                this.getTouchPetalSprite(layer, spriteKind, petalIndex),
                p2.petalX - spriteHalf,
                p2.petalY - spriteHalf,
                spriteHalf * 2,
                spriteHalf * 2
              );
            }
          }
        }
        if (part === "center") {
          ctx.globalAlpha = alpha;
          const centerSize = this.scaleByRadius(TOUCH_CENTER_DOT_RATIO) * 0.8;
          ctx.beginPath();
          ctx.arc(position.x, position.y, centerSize, 0, Math.PI * 2);
          this.stroke(COLORS.BLACK, strokeWidth * 3);
          ctx.fillStyle = isSimultaneous ? "#FFFF00" : "#00BFFF";
          ctx.fill();
          this.stroke(COLORS.WHITE, strokeWidth);
        }
        ctx.restore();
      };
      const commands = queue ?? [];
      commands.push({
        sourceIndex,
        isHold,
        draw: drawPart,
        position: this.mirrorTouchPosition(note.position),
        registeredAtMs: note.timingMs - approachTime
      });
      if (!queue) flushTouchDrawCommands(commands);
    }
    /** 渲染同位置多押缺口圆角外框（>=2 个生效，>=3 个叠加双层外框）。 */
    renderTouchBorder(position, isSimultaneous, visibleTouchCount) {
      if (visibleTouchCount < 2) {
        return;
      }
      const boxSize = this.scaleByRadius(1 / 4.46) * 1.1 * 1.2;
      const cornerRadius = this.scaleByRadius(NOTE_SIZE_RATIO);
      const color = isSimultaneous ? COLORS.SIMULTANEOUS_GOLD : COLORS.TOUCH_CYAN;
      if (visibleTouchCount >= 3) {
        const largerSize = boxSize * 1.2;
        this.drawTouchBorderBox(position.x, position.y, largerSize, cornerRadius, color, 3);
      }
      this.drawTouchBorderBox(position.x, position.y, boxSize, cornerRadius, color, 3);
    }
    /** 绘制单层带缺口的圆角矩形框。 */
    drawTouchBorderBox(x2, y2, size, cornerRadius, color, lineWidth) {
      const half = size / 2;
      const left = x2 - half;
      const top = y2 - half;
      const gap = size * 0.3;
      const ctx = this.context.ctx;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * this.context.radius / 300;
      ctx.beginPath();
      ctx.moveTo(left + cornerRadius, top);
      ctx.lineTo(left + size / 2 - gap / 2, top);
      ctx.moveTo(left + size / 2 + gap / 2, top);
      ctx.lineTo(left + size - cornerRadius, top);
      ctx.arcTo(left + size, top, left + size, top + cornerRadius, cornerRadius);
      ctx.lineTo(left + size, top + size / 2 - gap / 2);
      ctx.moveTo(left + size, top + size / 2 + gap / 2);
      ctx.lineTo(left + size, top + size - cornerRadius);
      ctx.arcTo(left + size, top + size, left + size - cornerRadius, top + size, cornerRadius);
      ctx.lineTo(left + size / 2 + gap / 2, top + size);
      ctx.moveTo(left + size / 2 - gap / 2, top + size);
      ctx.lineTo(left + cornerRadius, top + size);
      ctx.arcTo(left, top + size, left, top + size - cornerRadius, cornerRadius);
      ctx.lineTo(left, top + size / 2 + gap / 2);
      ctx.moveTo(left, top + size / 2 - gap / 2);
      ctx.lineTo(left, top + cornerRadius);
      ctx.arcTo(left, top, left + cornerRadius, top, cornerRadius);
      ctx.stroke();
      ctx.restore();
    }
    /** 在当前路径中追加圆角三角形（cornerRadius <= 0 退化为尖角）。 */
    drawRoundedTriangle(x1, y1, x2, y2, x3, y3, cornerRadius) {
      if (cornerRadius <= 0) {
        const ctx2 = this.context.ctx;
        ctx2.moveTo(x1, y1);
        ctx2.lineTo(x2, y2);
        ctx2.lineTo(x3, y3);
        ctx2.closePath();
        return;
      }
      const vertices = [
        { from: { x: x1, y: y1 }, to: { x: x2, y: y2 } },
        { from: { x: x2, y: y2 }, to: { x: x3, y: y3 } },
        { from: { x: x3, y: y3 }, to: { x: x1, y: y1 } }
      ];
      const ctx = this.context.ctx;
      for (let i2 = 0; i2 < 3; i2++) {
        const prevEdge = vertices[(i2 + 2) % 3];
        const currEdge = vertices[i2];
        const corner = currEdge.from;
        const dx1 = corner.x - prevEdge.from.x;
        const dy1 = corner.y - prevEdge.from.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const dx2 = currEdge.to.x - corner.x;
        const dy2 = currEdge.to.y - corner.y;
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        const nx1 = dx1 / len1;
        const ny1 = dy1 / len1;
        const nx2 = dx2 / len2;
        const ny2 = dy2 / len2;
        const r2 = Math.min(cornerRadius, len1 / 2, len2 / 2);
        const beforeX = corner.x - nx1 * r2;
        const beforeY = corner.y - ny1 * r2;
        const afterX = corner.x + nx2 * r2;
        const afterY = corner.y + ny2 * r2;
        if (i2 === 0) {
          ctx.moveTo(beforeX, beforeY);
        } else {
          ctx.lineTo(beforeX, beforeY);
        }
        ctx.quadraticCurveTo(corner.x, corner.y, afterX, afterY);
      }
      ctx.closePath();
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/utils/touchSourceIndices.ts
  function prepareTouchSourceIndices(notes) {
    const result = /* @__PURE__ */ new Map();
    const reserved = /* @__PURE__ */ new Set();
    for (const note of notes) {
      if (note.sourceNoteIndex !== void 0) reserved.add(note.sourceNoteIndex);
    }
    let index = 0;
    for (const note of notes) {
      if (note.type === "hold-end" || note.type === "hold-end-simultaneous" || note.type === "touch-hold-end")
        continue;
      const isTouch = note.type === "touch" || note.type === "touch-hold-start";
      if (note.sourceNoteIndex !== void 0) {
        if (isTouch) result.set(note, note.sourceNoteIndex);
        index = Math.max(index, note.sourceNoteIndex + 1);
      } else {
        while (reserved.has(index)) index++;
        if (isTouch) result.set(note, index);
        index++;
      }
    }
    return result;
  }

  // ../adx-dl/packages/maimai-chart-engine/src/core/timing/TimingTimeline.ts
  var TimingTimeline = class _TimingTimeline {
    constructor(defaultBpm, bpmEvents = null, divisorEvents = null) {
      this.defaultBpm = defaultBpm;
      this.bpmPoints = this.createBpmPoints(defaultBpm, bpmEvents);
      this.divisorEvents = divisorEvents ? [...divisorEvents].sort((a2, b2) => a2.timing - b2.timing) : [];
    }
    static fromChart(chart2) {
      return new _TimingTimeline(chart2.bpm, chart2.bpmEvents, chart2.divisorEvents);
    }
    /** 计算指定节拍对应的绝对时刻（ms）。负数或首个变速前的节拍按默认 BPM 线性推算。 */
    msFromBeat(beat) {
      const pointIndex = this.findLastLe(this.bpmPoints, (p2) => p2.timing, beat);
      if (pointIndex < 0) {
        return 6e4 * beat / this.defaultBpm;
      }
      const point = this.bpmPoints[pointIndex];
      return point.cumulativeMs + (beat - point.timing) * 6e4 / point.bpm;
    }
    /** 计算指定绝对时刻（ms）对应的节拍。负数或首个变速前的时间按默认 BPM 线性推算。 */
    beatFromMs(ms) {
      const pointIndex = this.findLastLe(this.bpmPoints, (p2) => p2.cumulativeMs, ms);
      if (pointIndex < 0) {
        return ms * this.defaultBpm / 6e4;
      }
      const point = this.bpmPoints[pointIndex];
      return point.timing + (ms - point.cumulativeMs) * point.bpm / 6e4;
    }
    /** 获取指定节拍处生效的 BPM。早于首个变速事件时返回默认 BPM。 */
    bpmAtBeat(beat) {
      const pointIndex = this.findLastLe(this.bpmPoints, (p2) => p2.timing, beat);
      return pointIndex < 0 ? this.defaultBpm : this.bpmPoints[pointIndex].bpm;
    }
    /** 获取指定节拍处生效的分频数。早于首个分频事件或未提供时默认返回 4。 */
    divisorAtBeat(beat) {
      const index = this.findLastLe(this.divisorEvents, (e2) => e2.timing, beat);
      return index < 0 ? 4 : this.divisorEvents[index].divisor;
    }
    createBpmPoints(defaultBpm, bpmEvents) {
      if (!bpmEvents || bpmEvents.length === 0) return [];
      const sortedEvents = [...bpmEvents].sort((a2, b2) => a2.timing - b2.timing);
      const points = [];
      let currentBpm = defaultBpm;
      let lastBeat = 0;
      let cumulativeMs = 0;
      for (const event of sortedEvents) {
        cumulativeMs += (event.timing - lastBeat) * 6e4 / currentBpm;
        points.push({
          timing: event.timing,
          bpm: event.bpm,
          cumulativeMs
        });
        lastBeat = event.timing;
        currentBpm = event.bpm;
      }
      return points;
    }
    findLastLe(arr, getValue, target) {
      let lo = 0;
      let hi = arr.length - 1;
      let result = -1;
      while (lo <= hi) {
        const mid = lo + hi >> 1;
        if (getValue(arr[mid]) <= target) {
          result = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return result;
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/types/index.ts
  function isTapNote(note) {
    return note.type === "tap" || note.type === "break" || note.type === "simultaneous";
  }
  function isHoldStartNote(note) {
    return note.type === "hold-start" || note.type === "hold-start-simultaneous";
  }
  function isHoldEndNote(note) {
    return note.type === "hold-end" || note.type === "hold-end-simultaneous";
  }
  function isSlideNote(note) {
    return note.type === "slide";
  }
  function isTouchNote(note) {
    return note.type === "touch";
  }
  function isTouchHoldStartNote(note) {
    return note.type === "touch-hold-start";
  }
  function isButtonNote(note) {
    return typeof note.position === "number" && note.position >= 1 && note.position <= 8;
  }

  // ../adx-dl/packages/maimai-chart-engine/src/effects/HoldEffectRenderer.ts
  var RIPPLE_CYCLE = HOLD_ACTIVE_CYCLE_MS / 1e3;
  var RIPPLE_EMIT_OFFSETS = [0, 4 / 60, 8 / 60];
  var RIPPLE_LIFETIME = 11 / 60;
  var RIPPLE_ATTACK = 1 / 60;
  var RIPPLE_PEAK_ALPHA = 1;
  var RIPPLE_BIRTH_RADIUS_RATIO = 0.1355;
  var RIPPLE_GROWTH_RATIO_PER_SEC = 0.735;
  var RIPPLE_INNER_SCALE = 0.8;
  var RIPPLE_OUTER_SCALE = 1.2;
  var RIPPLE_EDGE_COLOR = { r: 1, g: 0.889, b: 0.213 };
  var RIPPLE_CORE_WHITEN = 0.58;
  var RIPPLE_RING_PROFILE = [
    [0, 0],
    [0.063, 0.01],
    [0.125, 0.08],
    [0.188, 0.17],
    [0.25, 0.33],
    [0.313, 0.52],
    [0.375, 0.68],
    [0.438, 0.85],
    [0.5, 1],
    [0.563, 0.88],
    [0.625, 0.71],
    [0.688, 0.56],
    [0.75, 0.37],
    [0.813, 0.2],
    [0.875, 0.09],
    [0.938, 0.03],
    [1, 0.01]
  ];
  var ALPHA_EPS = 0.02;
  function rgba(color, a2) {
    const aa = Math.max(0, Math.min(1, a2));
    return `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},${aa})`;
  }
  var HoldEffectRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
    }
    /**
     * 渲染按住状态下的 Hold 持续波纹（时间处于 [timingMs, holdEnd.timingMs) 时绘制）。
     * holdEndMap 键需由 MainRenderer.getHoldEndKey 生成；[startIndex, endIndex) 为二分裁剪后的索引区间。
     */
    renderHoldPressEffects(holds, holdEndMap, currentTimeMs, getHoldEndKey, color = RIPPLE_EDGE_COLOR, startIndex = 0, endIndex = holds.length) {
      if (!holds.length) return;
      for (let i2 = startIndex; i2 < endIndex; i2++) {
        const hold = holds[i2];
        const holdEnd = holdEndMap.get(getHoldEndKey(hold.position, hold.timing));
        if (!holdEnd) continue;
        if (currentTimeMs < hold.timingMs || currentTimeMs >= holdEnd.timingMs) continue;
        const origin = this.getButtonPosition(hold.position);
        this.renderPressRippleAt(
          origin.x,
          origin.y,
          hold.timingMs,
          holdEnd.timingMs,
          currentTimeMs,
          color
        );
      }
    }
    /**
     * 在指定位置绘制 Hold 按压波纹（按键 Hold 与 Touch Hold 共用）。
     * 仅在 [startMs, endMs) 期间绘制；使用 screen 混合模式，内部通过 save/restore 隔离状态。
     */
    renderPressRippleAt(x2, y2, startMs, endMs, currentTimeMs, color = RIPPLE_EDGE_COLOR) {
      if (currentTimeMs < startMs || currentTimeMs >= endMs) return;
      if (this.context.radius <= 0) return;
      const ctx = this.context.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const elapsedSec = (currentTimeMs - startMs) / 1e3;
      this.drawRipples(ctx, x2, y2, elapsedSec, color);
      ctx.restore();
    }
    /** 枚举当前存活的波纹并按半径从大到小绘制。 */
    drawRipples(ctx, ox, oy, elapsedSec, color) {
      const firstCycle = Math.floor((elapsedSec - RIPPLE_LIFETIME) / RIPPLE_CYCLE);
      const lastCycle = Math.floor(elapsedSec / RIPPLE_CYCLE);
      const radiusPx = this.context.radius;
      const waves = [];
      for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
        for (let i2 = 0; i2 < RIPPLE_EMIT_OFFSETS.length; i2++) {
          const age = elapsedSec - (cycle * RIPPLE_CYCLE + RIPPLE_EMIT_OFFSETS[i2]);
          if (age < 0 || age >= RIPPLE_LIFETIME) continue;
          const peakRadius = (RIPPLE_BIRTH_RADIUS_RATIO + RIPPLE_GROWTH_RATIO_PER_SEC * age) * radiusPx;
          const alpha = RIPPLE_PEAK_ALPHA * Math.min(1, (RIPPLE_LIFETIME - age) / (RIPPLE_LIFETIME - RIPPLE_ATTACK));
          if (peakRadius < 0.75 || alpha <= ALPHA_EPS) continue;
          waves.push({ peakRadius, alpha });
        }
      }
      waves.sort((a2, b2) => b2.peakRadius - a2.peakRadius);
      for (let i2 = 0; i2 < waves.length; i2++) {
        const w2 = waves[i2];
        this.drawRippleRing(ctx, ox, oy, w2.peakRadius, color, w2.alpha);
      }
    }
    /**
     * 绘制单颗波纹环（环内透明）。
     * 环宽按峰半径等比缩放（实测 FWHM/峰半径恒为 0.165，非固定像素宽）。
     */
    drawRippleRing(ctx, x2, y2, peakRadius, color, alpha) {
      const inner = peakRadius * RIPPLE_INNER_SCALE;
      const outer = peakRadius * RIPPLE_OUTER_SCALE;
      if (outer - inner < 0.5 || alpha <= ALPHA_EPS) return;
      const texture = ctx.createRadialGradient(x2, y2, inner, x2, y2, outer);
      const brightness = alpha / RIPPLE_PEAK_ALPHA;
      for (const [stop, value] of RIPPLE_RING_PROFILE) {
        const whiten = RIPPLE_CORE_WHITEN * value * brightness * brightness;
        const tint = {
          r: color.r + (1 - color.r) * whiten,
          g: color.g + (1 - color.g) * whiten,
          b: color.b + (1 - color.b) * whiten
        };
        texture.addColorStop(stop, rgba(tint, value * alpha));
      }
      ctx.fillStyle = texture;
      ctx.beginPath();
      ctx.arc(x2, y2, outer, 0, Math.PI * 2);
      if (inner > 0.15) ctx.arc(x2, y2, inner, 0, Math.PI * 2, true);
      ctx.fill("evenodd");
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/effects/TapHitEffectRenderer.ts
  var HIT_FX_SPRITE_SUPERSAMPLE = 2;
  var HIT_FX_CORE_BLUR_RATIO = 4 / 300 * 0.7;
  var HIT_FX_HALO_BLUR_SCALE = 2.4;
  var HIT_FX_HALO_ALPHA = 0.55;
  var SPRITE_BLUR_TAIL_RATIO = 2.5;
  var SPRITE_AA_MARGIN_PX = 1;
  var TapHitEffectRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
      // 命中特效 stamp 缓存（六边形/星各一张含 glow），radius/backingScale/color 变化时失效
      this.hitEffectShapeCache = /* @__PURE__ */ new Map();
      this.hitEffectShapeBasis = "";
    }
    /** 计算命中特效坐标与进度（progress ∈ [0, 1]）；未激活返回 progress: -1。 */
    calculateHitEffectPosition(note, currentTimeMs) {
      const position = note.position;
      const angle = this.getButtonAngle(position);
      const timeDiff = currentTimeMs - note.timingMs;
      if (timeDiff < 0 || timeDiff > NOTE_HIT_EFFECT_DURATION_MS) return { x: 0, y: 0, progress: -1 };
      return {
        x: this.context.centerX + Math.cos(angle) * this.context.radius,
        y: this.context.centerY + Math.sin(angle) * this.context.radius,
        progress: timeDiff / NOTE_HIT_EFFECT_DURATION_MS
      };
    }
    hexagonSubPath(p2, centerX, centerY, radius, angle) {
      for (let i2 = 0; i2 < 6; i2++) {
        const a2 = i2 * Math.PI / 3 + angle;
        const px = centerX + radius * Math.cos(a2);
        const py = centerY + radius * Math.sin(a2);
        if (i2 === 0) p2.moveTo(px, py);
        else p2.lineTo(px, py);
      }
      p2.closePath();
    }
    starSubPath(p2, centerX, centerY, spikesCount, outerRadius, innerRadius, angle) {
      const step = Math.PI / spikesCount;
      let a2 = Math.PI / 2 * 3 + angle;
      for (let i2 = 0; i2 < spikesCount; i2++) {
        const ox = centerX + Math.cos(a2) * outerRadius;
        const oy = centerY + Math.sin(a2) * outerRadius;
        if (i2 === 0) p2.moveTo(ox, oy);
        else p2.lineTo(ox, oy);
        a2 += step;
        p2.lineTo(centerX + Math.cos(a2) * innerRadius, centerY + Math.sin(a2) * innerRadius);
        a2 += step;
      }
      p2.closePath();
    }
    /** 渲染按键命中特效（朝向沿按键方向向外）。 */
    renderTapHitEffect(x2, y2, position, color, progress, type) {
      this.renderHitEffectAt(x2, y2, this.getButtonAngle(position), color, progress, type);
    }
    /**
     * 渲染命中特效本体。angle 决定星群朝向（按键音符向外，Touch Hold 指向圆心）。
     * progress ∈ [0, 1] 为归一化进度，超出区间或透明度归零跳过。
     */
    renderHitEffectAt(x2, y2, angle, color, progress, type) {
      const scale = 1 - 0.75 * (progress - 1) * (progress - 1);
      const alpha = 1 - 4 * (progress - 0.5) * (progress - 0.5);
      if (alpha <= 0 || scale <= 0) return;
      const subAng = 1 - (progress - 1) * (progress - 1);
      const subRad = Math.max(0, Math.min(1, 1 - 8 / 9 * progress * progress));
      const baseR = this.scaleByRadius(NOTE_SIZE_RATIO) * 1.36 * 1.5;
      if (baseR <= 0) return;
      const r0 = baseR * scale;
      const rSmall = r0 * 0.7;
      const rBig = r0 * 0.8;
      const off = baseR * subRad * 0.7;
      const sprite = this.getHitEffectShapeSprite(type, color);
      const logical = sprite.width / HIT_FX_SPRITE_SUPERSAMPLE;
      const destSize = (r2) => logical * (r2 / baseR);
      const ctx = this.context.ctx;
      ctx.save();
      ctx.translate(x2, y2);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      const blit = (lx, ly, r2) => {
        const s2 = destSize(r2);
        ctx.drawImage(sprite, lx - s2 / 2, ly - s2 / 2, s2, s2);
      };
      blit(0, 0, r0);
      const sub1 = Math.PI / 6;
      const sub2 = -Math.PI / 6;
      const a1a = sub1 + Math.PI * subAng;
      blit(Math.cos(a1a) * off, Math.sin(a1a) * off * 0.7, rSmall);
      const a1b = sub1 + Math.PI * (1 + subAng);
      blit(Math.cos(a1b) * off, Math.sin(a1b) * off, rSmall);
      const a2a = sub2 - Math.PI * subAng;
      blit(Math.cos(a2a) * off, Math.sin(a2a) * off, rBig);
      const a2b = sub2 + Math.PI * (1 - subAng);
      blit(Math.cos(a2b) * off, Math.sin(a2b) * off, rBig);
      ctx.restore();
    }
    /**
     * 烘焙单颗六边形/星 stamp（核心 blur + 低 alpha halo）；热路径按 progress 摆 5 份。
     * filter 半径按超采样 backing 像素计算；live 热路径严禁直接设 ctx.filter 造成掉帧。
     * 判定圈半径、backingScale 或颜色变化时缓存失效。
     */
    getHitEffectShapeSprite(type, color) {
      const cx = this.context.centerX;
      const backingScale = cx > 0 ? this.context.canvas.width / (cx * 2) : 1;
      const basis = `${this.context.radius}|${backingScale}|${color}`;
      if (basis !== this.hitEffectShapeBasis) {
        this.hitEffectShapeCache.clear();
        this.hitEffectShapeBasis = basis;
      }
      const cached = this.hitEffectShapeCache.get(type);
      if (cached) return cached;
      const refR = this.scaleByRadius(NOTE_SIZE_RATIO) * 1.36 * 1.5;
      const coreBlurPx = this.scaleByRadius(HIT_FX_CORE_BLUR_RATIO) * HIT_FX_SPRITE_SUPERSAMPLE;
      const haloBlurPx = coreBlurPx * HIT_FX_HALO_BLUR_SCALE;
      const strokeHalf = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO);
      const half = refR + strokeHalf + haloBlurPx / HIT_FX_SPRITE_SUPERSAMPLE * SPRITE_BLUR_TAIL_RATIO + SPRITE_AA_MARGIN_PX;
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = Math.max(2, Math.ceil(half * 2 * HIT_FX_SPRITE_SUPERSAMPLE));
      const offscreenCtx = sprite.getContext("2d");
      offscreenCtx.setTransform(
        HIT_FX_SPRITE_SUPERSAMPLE,
        0,
        0,
        HIT_FX_SPRITE_SUPERSAMPLE,
        sprite.width / 2,
        sprite.height / 2
      );
      const path = new Path2D();
      if (type === "star") {
        this.starSubPath(path, 0, 0, 5, refR, refR * 0.5, Math.PI);
      } else {
        this.hexagonSubPath(path, 0, 0, refR, 0);
      }
      offscreenCtx.strokeStyle = color;
      offscreenCtx.lineWidth = this.scaleByRadius(NOTE_STROKE_WIDTH_RATIO) * 2;
      offscreenCtx.lineJoin = "round";
      if (haloBlurPx >= 0.5) {
        offscreenCtx.save();
        offscreenCtx.globalAlpha = HIT_FX_HALO_ALPHA;
        offscreenCtx.filter = `blur(${haloBlurPx}px)`;
        offscreenCtx.stroke(path);
        offscreenCtx.restore();
      }
      if (coreBlurPx >= 0.5) offscreenCtx.filter = `blur(${coreBlurPx}px)`;
      offscreenCtx.stroke(path);
      this.hitEffectShapeCache.set(type, sprite);
      return sprite;
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/effects/constants.ts
  var HIT_EFFECT_COLORS = {
    white: { r: 1, g: 1, b: 1 },
    good: { r: 0.25, g: 1, b: 0.25 },
    great: { r: 1, g: 0.33, b: 0.33 },
    perfect: { r: 1, g: 1, b: 0 }
  };
  var TOUCH_RING_ALPHA_PROFILE = [
    0.666,
    0.667,
    0.671,
    0.679,
    0.685,
    0.693,
    0.7,
    0.709,
    0.718,
    0.727,
    0.736,
    0.744,
    0.753,
    0.763,
    0.772,
    0.781,
    0.791,
    0.8,
    0.809,
    0.818,
    0.826,
    0.835,
    0.843,
    0.851,
    0.858,
    0.866,
    0.872,
    0.879,
    0.887,
    0.896,
    0.905,
    0.913,
    0.922,
    0.93,
    0.938,
    0.946,
    0.953,
    0.959,
    0.964,
    0.969,
    0.974,
    0.977,
    0.981,
    0.984,
    0.986,
    0.987,
    0.989,
    0.993,
    0.998,
    1,
    0.896,
    0.584,
    0.374,
    0.248,
    0.155,
    0.087,
    0.038,
    8e-3,
    2e-3,
    0,
    0,
    0
  ];

  // ../adx-dl/packages/maimai-chart-engine/src/effects/TouchHitEffectRenderer.ts
  var ROOT_SCALE = 70;
  var LIFE = 0.5;
  var RING_START_SIZE = 2.5 * ROOT_SCALE;
  var RING_MAX_SIZE = 540;
  var SMALL_COUNT = 8;
  var SMALL_SHAPE_R = 0.5 * ROOT_SCALE;
  var SMALL_SIZE = 0.3 * ROOT_SCALE;
  var ROUND_COUNT = 8;
  var ROUND_SHAPE_R = 0.6 * ROOT_SCALE;
  var ROUND_SIZE = 0.6 * ROOT_SCALE;
  var ROUND_START_SPEED = 10 * ROOT_SCALE;
  var ROUND_CLAMP_SPEED = 2 * ROOT_SCALE;
  var STAR_SPRITE_REF_OUTER_R = 32;
  var STAR_SPRITE_HALF_RATIO = 1.4;
  var RING_SIZE_KEYS = [
    { t: 0, v: 0, inSlope: 10.02783, outSlope: 10.02783 },
    { t: 0.0734887, v: 0.482223, inSlope: 2.93804, outSlope: 2.93804 },
    { t: 0.3209003, v: 0.834577, inSlope: 0.592962, outSlope: 0.592962 },
    { t: 1, v: 1, inSlope: 0.180534, outSlope: 0.180534 }
  ];
  var RING_ALPHA_KEYS = [
    { t: 0, v: 1 },
    { t: 5484 / 65535, v: 1 },
    { t: 18591 / 65535, v: 0.141176 },
    { t: 31029 / 65535, v: 0.031373 },
    { t: 45607 / 65535, v: 0 },
    { t: 1, v: 0 }
  ];
  var STAR_SIZE_KEYS = [
    { t: 0, v: 0.755245, inSlope: 2.38315, outSlope: 2.38315 },
    { t: 0.127286, v: 1, inSlope: 0.061337, outSlope: 0.061337 },
    { t: 0.272332, v: 0.892134, inSlope: -0.927502, outSlope: -0.927502 },
    { t: 0.540943, v: 0.811183, inSlope: -0.114026, outSlope: -0.114026 },
    { t: 1, v: 0, inSlope: 0.036313, outSlope: 0.036313 }
  ];
  var CLAMP_MAG_KEYS = [
    { t: 0, v: 1, inSlope: -2.726415, outSlope: -2.726415 },
    { t: 1, v: 0, inSlope: 0, outSlope: 0 }
  ];
  function evalHermite(keys, t2) {
    if (t2 <= keys[0].t) return keys[0].v;
    if (t2 >= keys[keys.length - 1].t) return keys[keys.length - 1].v;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      const a2 = keys[i2];
      const b2 = keys[i2 + 1];
      if (t2 < a2.t || t2 > b2.t) continue;
      const dt = b2.t - a2.t || 1;
      const u = (t2 - a2.t) / dt;
      const u2 = u * u;
      const u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * a2.v + (u3 - 2 * u2 + u) * a2.outSlope * dt + (-2 * u3 + 3 * u2) * b2.v + (u3 - u2) * b2.inSlope * dt;
    }
    return keys[keys.length - 1].v;
  }
  function evalKeys(keys, t2) {
    if (t2 <= keys[0].t) return keys[0].v;
    if (t2 >= keys[keys.length - 1].t) return keys[keys.length - 1].v;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      const a2 = keys[i2];
      const b2 = keys[i2 + 1];
      if (t2 >= a2.t && t2 <= b2.t) {
        const u = (t2 - a2.t) / (b2.t - a2.t || 1);
        return a2.v + (b2.v - a2.v) * u;
      }
    }
    return keys[keys.length - 1].v;
  }
  function hash01(seed) {
    let x2 = (seed | 0) * 1664525 + 1013904223;
    x2 = (x2 ^ x2 >>> 16) >>> 0;
    return x2 / 4294967296;
  }
  function rgba2(color, a2) {
    const aa = Math.max(0, Math.min(1, a2));
    return `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},${aa})`;
  }
  function clampedTravel(age, startSpeed, clampSpeed) {
    if (age <= 0) return 0;
    const steps = Math.max(6, Math.ceil(age * 60));
    const dt = age / steps;
    let speed = startSpeed;
    let dist = 0;
    for (let i2 = 0; i2 < steps; i2++) {
      const life = Math.min(1, (i2 + 0.5) * dt / LIFE);
      const maxSp = Math.max(0, evalHermite(CLAMP_MAG_KEYS, life) * clampSpeed);
      if (speed > maxSp) speed = maxSp;
      dist += speed * dt;
    }
    return dist;
  }
  var TouchHitEffectRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
      // 星点贴图缓存（4 帧），backingScale 或颜色变化时失效
      this.starSprites = null;
      this.starSpriteBasis = "";
    }
    /**
     * 渲染当前时间窗口（500ms）内的 Touch 命中特效。
     * - touches 必须按 timingMs 升序排列（内部依赖二分查找筛选窗口）；
     * - 只处理普通 Touch，自动跳过 Touch Hold；同传感器有多个只播最新的；
     * - 使用 lighter 混合模式绘制，内部已通过 save/restore 隔离状态。
     */
    renderTouchHitEffects(touches, currentTimeMs, color = HIT_EFFECT_COLORS.perfect) {
      if (!touches.length) return;
      const unitPx = this.context.radius / PANEL_RADIUS_UNITS;
      if (unitPx <= 0) return;
      const windowStart = currentTimeMs - LIFE * 1e3;
      let lo = 0;
      let hi = touches.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (touches[mid].timingMs < windowStart) lo = mid + 1;
        else hi = mid;
      }
      const lastByPos = /* @__PURE__ */ new Map();
      for (let i2 = lo; i2 < touches.length; i2++) {
        const n2 = touches[i2];
        if (n2.timingMs > currentTimeMs) break;
        if (n2.type === "touch-hold-start") continue;
        const key = String(n2.position);
        const prev = lastByPos.get(key);
        if (prev === void 0 || n2.timingMs > prev) lastByPos.set(key, n2.timingMs);
      }
      const ctx = this.context.ctx;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i2 = lo; i2 < touches.length; i2++) {
        const note = touches[i2];
        if (note.timingMs > currentTimeMs) break;
        if (note.type === "touch-hold-start") continue;
        const latest = lastByPos.get(String(note.position));
        if (latest !== void 0 && latest > note.timingMs) continue;
        const age = (currentTimeMs - note.timingMs) / 1e3;
        if (age < 0 || age >= LIFE) continue;
        const origin = this.getTouchPosition(note.position);
        let seed = Math.round(note.timingMs * 1e3);
        for (let c2 = 0; c2 < note.position.length; c2++) {
          seed = seed ^ note.position.charCodeAt(c2) * (c2 + 1) * 73856093 | 0;
        }
        this.drawCenterRing(ctx, origin.x, origin.y, age, unitPx, color);
        this.drawStarBurst(
          ctx,
          origin.x,
          origin.y,
          age,
          unitPx,
          color,
          seed,
          SMALL_COUNT,
          SMALL_SHAPE_R,
          SMALL_SIZE,
          0,
          0
        );
        this.drawStarBurst(
          ctx,
          origin.x,
          origin.y,
          age,
          unitPx,
          color,
          seed ^ 2246822519,
          ROUND_COUNT,
          ROUND_SHAPE_R,
          ROUND_SIZE,
          ROUND_START_SPEED,
          ROUND_CLAMP_SPEED
        );
      }
      ctx.restore();
    }
    /** 绘制中心向外扩散的光环。 */
    drawCenterRing(ctx, ox, oy, age, unitPx, color) {
      const life = age / LIFE;
      const sizeMul = Math.max(0, evalHermite(RING_SIZE_KEYS, life));
      let diameter = RING_START_SIZE * sizeMul;
      if (diameter > RING_MAX_SIZE) diameter = RING_MAX_SIZE;
      const radius = diameter * unitPx / 2;
      if (radius < 0.5) return;
      const alpha = evalKeys(RING_ALPHA_KEYS, life);
      if (alpha <= 0.01) return;
      const profile = TOUCH_RING_ALPHA_PROFILE;
      const last = profile.length - 1;
      const gradient = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
      for (let i2 = 0; i2 <= last; i2++) {
        gradient.addColorStop(i2 / last * 0.96, rgba2(color, profile[i2] * alpha));
      }
      gradient.addColorStop(1, rgba2(color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ox, oy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    /** 绘制星点粒子群（原地缩放闪烁或带阻尼向外扩散）。 */
    drawStarBurst(ctx, ox, oy, age, unitPx, color, seedBase, count, shapeR, startSize, startSpeed, clampSpeed) {
      const life = age / LIFE;
      const sizeMul = Math.max(0, evalHermite(STAR_SIZE_KEYS, life));
      if (sizeMul <= 0.02) return;
      const alpha = Math.min(1, sizeMul * 1.05);
      const travel = startSpeed > 0 && clampSpeed > 0 ? clampedTravel(age, startSpeed, clampSpeed) : 0;
      const sprites = this.getStarSprites(color);
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i2 = 0; i2 < count; i2++) {
        const h1 = hash01(seedBase + i2 * 4 + 1);
        const h2 = hash01(seedBase + i2 * 4 + 2);
        const h3 = hash01(seedBase + i2 * 4 + 3);
        const h4 = hash01(seedBase + i2 * 4 + 4);
        const angle = h1 * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x2 = ox + (cos * shapeR + cos * travel) * unitPx;
        const y2 = oy + (sin * shapeR + sin * travel) * unitPx;
        const size = startSize * sizeMul * unitPx * (0.9 + 0.2 * h2);
        const outerR = size * 0.55;
        if (outerR < 0.5) continue;
        const frame2 = Math.min(3, Math.floor(h4 * 4));
        const destHalf = outerR * STAR_SPRITE_HALF_RATIO;
        ctx.save();
        ctx.translate(x2, y2);
        ctx.rotate(h3 * Math.PI * 2);
        ctx.drawImage(sprites[frame2], -destHalf, -destHalf, destHalf * 2, destHalf * 2);
        ctx.restore();
      }
      ctx.restore();
    }
    /** 获取或烘焙 4 帧星点贴图，backingScale 或颜色变化时重新生成。 */
    getStarSprites(color) {
      const cx = this.context.centerX;
      const backingScale = cx > 0 ? this.context.canvas.width / (cx * 2) : 1;
      const basis = `${backingScale}|${color.r}|${color.g}|${color.b}`;
      if (this.starSprites && this.starSpriteBasis === basis) return this.starSprites;
      const half = STAR_SPRITE_REF_OUTER_R * STAR_SPRITE_HALF_RATIO;
      const sizePx = Math.max(2, Math.ceil(half * 2 * Math.max(1, backingScale)));
      const sprites = [];
      for (let frame2 = 0; frame2 < 4; frame2++) {
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = sizePx;
        const sctx = sprite.getContext("2d");
        sctx.setTransform(
          Math.max(1, backingScale),
          0,
          0,
          Math.max(1, backingScale),
          sizePx / 2,
          sizePx / 2
        );
        this.drawStarFrame(sctx, 0, 0, STAR_SPRITE_REF_OUTER_R, 0, color, 1, frame2);
        sprites.push(sprite);
      }
      this.starSprites = sprites;
      this.starSpriteBasis = basis;
      return sprites;
    }
    /** 绘制单帧星点（0: 软心光晕、1: 宽实心、2: 窄实心、3: 双层描边）。 */
    drawStarFrame(ctx, x2, y2, outerR, rotation, color, alpha, frame2) {
      if (outerR < 0.4 || alpha <= 0) return;
      ctx.save();
      ctx.translate(x2, y2);
      ctx.rotate(rotation);
      switch (frame2) {
        case 0:
          this.fillStarGradient(ctx, outerR * 1.08, outerR * 0.23, color, alpha, true);
          break;
        case 1:
          this.fillStarGradient(ctx, outerR, outerR * 0.23, color, alpha, false);
          break;
        case 2:
          this.fillStarGradient(ctx, outerR * 0.94, outerR * 0.19, color, alpha * 0.94, false);
          break;
        case 3:
          this.strokeStar(ctx, outerR, outerR * 0.2, color, alpha);
          break;
      }
      ctx.restore();
    }
    /** 在星形裁剪区填充径向渐变（hollow 为 true 时中心微透做软心，false 为高亮白心）。 */
    fillStarGradient(ctx, tipR, waistR, color, alpha, hollow) {
      ctx.save();
      ctx.beginPath();
      this.pathSparkle(ctx, tipR, waistR);
      ctx.clip();
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, tipR);
      if (hollow) {
        gradient.addColorStop(0, rgba2(color, alpha * 0.03));
        gradient.addColorStop(0.34, rgba2(color, alpha * 0.14));
        gradient.addColorStop(0.72, rgba2(color, alpha * 0.82));
        gradient.addColorStop(1, rgba2(color, 0));
      } else {
        gradient.addColorStop(0, rgba2({ r: 1, g: 1, b: 0.94 }, alpha * 0.95));
        gradient.addColorStop(0.35, rgba2(color, alpha * 0.95));
        gradient.addColorStop(0.82, rgba2(color, alpha * 0.72));
        gradient.addColorStop(1, rgba2(color, 0));
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(-tipR, -tipR, tipR * 2, tipR * 2);
      ctx.restore();
    }
    /** 绘制外层发光 + 内层高亮边缘的双层描边星形。 */
    strokeStar(ctx, tipR, waistR, color, alpha) {
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      this.pathSparkle(ctx, tipR * 1.08, waistR * 1.08);
      ctx.strokeStyle = rgba2(color, alpha * 0.22);
      ctx.lineWidth = Math.max(1, tipR * 0.13);
      ctx.stroke();
      ctx.beginPath();
      this.pathSparkle(ctx, tipR, waistR);
      ctx.strokeStyle = rgba2({ r: 1, g: 1, b: 0.94 }, alpha * 0.88);
      ctx.lineWidth = Math.max(0.8, tipR * 0.055);
      ctx.stroke();
      ctx.restore();
    }
    /** 构建四角星路径（尖端在 90° 方向，两尖之间用内凹二次贝塞尔连接）。 */
    pathSparkle(ctx, tipR, waistR) {
      for (let i2 = 0; i2 < 4; i2++) {
        const aTip = i2 * Math.PI / 2 - Math.PI / 2;
        const aWaist = aTip + Math.PI / 4;
        const aNextTip = aTip + Math.PI / 2;
        const tx = Math.cos(aTip) * tipR;
        const ty = Math.sin(aTip) * tipR;
        const wx = Math.cos(aWaist) * waistR;
        const wy = Math.sin(aWaist) * waistR;
        const nextX = Math.cos(aNextTip) * tipR;
        const nextY = Math.sin(aNextTip) * tipR;
        if (i2 === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
        ctx.quadraticCurveTo(wx, wy, nextX, nextY);
      }
      ctx.closePath();
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/effects/TouchFireworkRenderer.ts
  var FIREWORK_DURATION_MS = 1333;
  var FIREWORK_EXTENT_RATIO = 5 / 4.5 * 1.05;
  var FIREWORK_SCALE_PEAK = 5;
  var FIREWORK_SPRITE_MIN_SCALE = 2.5;
  var FIREWORK_HOLE_START_SEC = 0.6;
  var FIREWORK_END_SEC = 1.1;
  function fireworkTriggerMs(note) {
    return note.type === "touch-hold-start" ? note.timingMs + note.durationMs : note.timingMs;
  }
  var FIREWORK_PETAL_COLORS = [
    "#FFB3BA",
    "#FFD0A8",
    "#FFFAB8",
    "#D8F0A8",
    "#B8E0B0",
    "#A8E0CC",
    "#A8C8E8",
    "#B8B0E8",
    "#D0B0E8",
    "#F0B0D8",
    "#FFC9A8",
    "#FFEFA8",
    "#C8E8A8",
    "#A8E0BC",
    "#A8CCE8"
  ];
  var TouchFireworkRenderer = class extends BaseRenderer {
    constructor(context) {
      super(context);
      // 烟花贴图缓存（峰值尺寸离屏 Canvas 与 ImageBitmap）
      this.fireworkWedgeSprite = null;
      this.fireworkWedgeBitmap = null;
      this.fireworkSpriteBasis = "";
      // 烟花消散期 destination-out 擦除掩膜中间画布
      this.fireworkScratch = null;
      this.fireworkScratchCtx = null;
    }
    /** 获取或烘焙全分辨率烟花楔形离屏贴图（radius 或 backingScale 变化时重建，异步生成 ImageBitmap）。 */
    getWedgeSprite() {
      const backingScale = this.getBackingScale();
      const basis = `${this.context.radius}|${backingScale}`;
      if (this.fireworkWedgeSprite && this.fireworkSpriteBasis === basis) {
        return this.fireworkWedgeSprite;
      }
      const half = this.context.radius * FIREWORK_EXTENT_RATIO;
      const sizePx = Math.max(2, Math.ceil(half * 2 * backingScale));
      const sprite = document.createElement("canvas");
      sprite.width = sizePx;
      sprite.height = sizePx;
      const spriteCtx = sprite.getContext("2d");
      spriteCtx.setTransform(backingScale, 0, 0, backingScale, sizePx / 2, sizePx / 2);
      const outerR = this.context.radius / 4.5 * FIREWORK_SCALE_PEAK;
      spriteCtx.globalAlpha = 0.589;
      const N2 = FIREWORK_PETAL_COLORS.length;
      const halfWidth = Math.PI / N2 * 0.45;
      const FADE_INNER = 0.9;
      for (let i2 = 0; i2 < N2; i2++) {
        const angle = i2 / N2 * Math.PI * 2;
        const path = new Path2D();
        path.moveTo(0, 0);
        path.lineTo(Math.cos(angle - halfWidth) * outerR, Math.sin(angle - halfWidth) * outerR);
        path.lineTo(Math.cos(angle + halfWidth) * outerR, Math.sin(angle + halfWidth) * outerR);
        path.closePath();
        const color = FIREWORK_PETAL_COLORS[i2];
        const grad = spriteCtx.createRadialGradient(0, 0, 0, 0, 0, outerR);
        grad.addColorStop(0, color);
        grad.addColorStop(FADE_INNER, color);
        grad.addColorStop(1, color + "00");
        spriteCtx.fillStyle = grad;
        spriteCtx.fill(path);
      }
      this.fireworkWedgeSprite = sprite;
      this.fireworkSpriteBasis = basis;
      this.fireworkWedgeBitmap?.close();
      this.fireworkWedgeBitmap = null;
      if (typeof createImageBitmap === "function") {
        createImageBitmap(sprite).then((bitmap) => {
          if (this.fireworkSpriteBasis !== basis || this.fireworkWedgeSprite !== sprite) {
            bitmap.close();
            return;
          }
          this.fireworkWedgeBitmap = bitmap;
          const ctx = this.context.ctx;
          const size = this.context.radius * FIREWORK_EXTENT_RATIO * 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(this.context.centerX, this.context.centerY, this.context.centerX, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = 1 / 255;
          ctx.translate(this.context.centerX, this.context.centerY);
          ctx.rotate(0.1);
          ctx.drawImage(bitmap, -size / 2, -size / 2, size, size);
          ctx.drawImage(bitmap, -size / 4, -size / 4, size / 2, size / 2);
          ctx.restore();
        }).catch(() => {
        });
      }
      return sprite;
    }
    /** 获取烟花图像源（优先使用 ImageBitmap，未就绪回退离屏 Canvas）。 */
    getWedgeImage() {
      const sprite = this.getWedgeSprite();
      return this.fireworkWedgeBitmap ?? sprite;
    }
    /** 矢量绘制烟花楔形（小缩放比例阶段使用）。 */
    drawWedgesVector(ctx, x2, y2, scale, rotation) {
      const outerR = this.context.radius / 4.5 * scale;
      if (outerR <= 0) return;
      ctx.save();
      ctx.globalAlpha = 0.589;
      const N2 = FIREWORK_PETAL_COLORS.length;
      const halfWidth = Math.PI / N2 * 0.45;
      const FADE_INNER = 0.9;
      for (let i2 = 0; i2 < N2; i2++) {
        const angle = i2 / N2 * Math.PI * 2 + rotation;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 + Math.cos(angle - halfWidth) * outerR,
          y2 + Math.sin(angle - halfWidth) * outerR
        );
        ctx.lineTo(
          x2 + Math.cos(angle + halfWidth) * outerR,
          y2 + Math.sin(angle + halfWidth) * outerR
        );
        ctx.closePath();
        const color = FIREWORK_PETAL_COLORS[i2];
        const grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, outerR);
        grad.addColorStop(0, color);
        grad.addColorStop(FADE_INNER, color);
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
    }
    /** 预热烟花贴图与中间合成画布，建议在首个烟花触发前调用。 */
    warmFireworkResources() {
      const backingScale = this.getBackingScale();
      const basis = `${this.context.radius}|${backingScale}`;
      if (this.fireworkSpriteBasis === basis && this.fireworkScratch) return;
      const sprite = this.getWedgeSprite();
      const half = this.context.radius * FIREWORK_EXTENT_RATIO;
      const sizePx = Math.max(2, Math.ceil(half * 2 * backingScale));
      const scratch = this.acquireFireworkScratch(sizePx);
      scratch.drawImage(sprite, 0, 0);
      scratch.globalCompositeOperation = "destination-out";
      const scratchGrad = scratch.createRadialGradient(0, 0, 0, 0, 0, 1);
      scratchGrad.addColorStop(0, "rgba(0,0,0,1)");
      scratchGrad.addColorStop(0.5, "rgba(0,0,0,1)");
      scratchGrad.addColorStop(1, "rgba(0,0,0,0)");
      scratch.fillStyle = scratchGrad;
      scratch.fillRect(0, 0, 2, 2);
      scratch.globalCompositeOperation = "source-over";
      const ctx = this.context.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.context.centerX, this.context.centerY, this.context.centerX, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 1 / 255;
      ctx.translate(this.context.centerX, this.context.centerY);
      ctx.rotate(0.1);
      ctx.drawImage(sprite, -half, -half, half * 2, half * 2);
      ctx.drawImage(this.fireworkScratch, -half, -half, half * 2, half * 2);
      ctx.rotate(-0.1);
      ctx.scale(0.01, 0.01);
      this.drawWedgesVector(ctx, 0, 0, 1, 0.1);
      this.drawFireworkBalls(ctx, 0, 0, 0.3);
      ctx.restore();
    }
    /** 获取或调整烟花中间合成画布（自动重置变换并清空）。 */
    acquireFireworkScratch(sizePx) {
      if (!this.fireworkScratch || this.fireworkScratch.width !== sizePx) {
        this.fireworkScratch = document.createElement("canvas");
        this.fireworkScratch.width = sizePx;
        this.fireworkScratch.height = sizePx;
        this.fireworkScratchCtx = this.fireworkScratch.getContext("2d");
      }
      const ctx = this.fireworkScratchCtx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, sizePx, sizePx);
      return ctx;
    }
    /** 绘制烟花中心光晕（外圈光晕 + 内核高光，使用 lighter 混合）。 */
    drawFireworkBalls(ctx, x2, y2, growT) {
      if (growT < 0) return;
      const baseRadius = this.context.radius / 4.5;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const BIG_GROW = 0.06;
      const BIG_RISE = 0.04;
      const bigRMax = baseRadius * 1.3;
      const BIG_DECAY_END = FIREWORK_DURATION_MS / 1e3 - 0.1;
      const BIG_PEAK_ALPHA = 0.7;
      let bigAlpha = 0;
      let bigR = 0;
      if (growT < BIG_GROW) {
        bigR = growT / BIG_GROW * bigRMax;
        bigAlpha = BIG_PEAK_ALPHA * Math.min(1, growT / BIG_RISE);
      } else {
        const d2 = (growT - BIG_GROW) / (BIG_DECAY_END - BIG_GROW);
        bigR = bigRMax * (1 - d2);
        bigAlpha = BIG_PEAK_ALPHA * (1 - d2);
      }
      if (bigAlpha > 0 && bigR > 0) {
        ctx.globalAlpha = bigAlpha;
        const grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, bigR);
        grad.addColorStop(0, "rgb(255, 235, 200)");
        grad.addColorStop(1, "rgba(255, 180, 100, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x2, y2, bigR, 0, Math.PI * 2);
        ctx.fill();
      }
      const SMALL_GROW = 0.04;
      const SMALL_RISE = 0.02;
      const smallRMax = baseRadius * 0.55;
      const SMALL_DECAY_END = 0.55;
      const SMALL_PEAK_ALPHA = 0.6;
      let smallAlpha = 0;
      let smallR = 0;
      if (growT < SMALL_GROW) {
        smallR = growT / SMALL_GROW * smallRMax;
        smallAlpha = SMALL_PEAK_ALPHA * Math.min(1, growT / SMALL_RISE);
      } else if (growT < SMALL_DECAY_END) {
        const d2 = (growT - SMALL_GROW) / (SMALL_DECAY_END - SMALL_GROW);
        smallR = smallRMax * (1 - d2);
        smallAlpha = SMALL_PEAK_ALPHA * (1 - d2);
      }
      if (smallAlpha > 0 && smallR > 0) {
        ctx.globalAlpha = smallAlpha;
        const grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, smallR);
        grad.addColorStop(0, "rgb(255, 245, 220)");
        grad.addColorStop(1, "rgba(255, 220, 160, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x2, y2, smallR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    /**
     * 渲染当前活跃的触控烟花特效（单例）。
     * touches 必须已按 hasFirework 过滤并按 fireworkTriggerMs 升序排列（内部二分查找定位最新）。
     */
    renderTouchFireworks(touches, currentTimeMs) {
      let lo = 0;
      let hi = touches.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (fireworkTriggerMs(touches[mid]) <= currentTimeMs) lo = mid + 1;
        else hi = mid;
      }
      const latestNote = lo > 0 ? touches[lo - 1] : null;
      if (!latestNote) return;
      const ageMs = currentTimeMs - fireworkTriggerMs(latestNote);
      if (ageMs >= FIREWORK_DURATION_MS) return;
      const tSec = ageMs / 1e3;
      if (tSec >= FIREWORK_END_SEC) return;
      let scale;
      if (tSec < 0.1) scale = 0;
      else if (tSec < 0.5) {
        const u2 = (tSec - 0.1) / 0.4;
        scale = (1 - Math.pow(1 - u2, 3)) * FIREWORK_SCALE_PEAK;
      } else scale = FIREWORK_SCALE_PEAK;
      const position = this.getTouchPosition(latestNote.position);
      const rotation = ageMs / FIREWORK_DURATION_MS * (72 * Math.PI / 180);
      const ctx = this.context.ctx;
      const half = this.context.radius * FIREWORK_EXTENT_RATIO;
      if (tSec <= FIREWORK_HOLE_START_SEC) {
        if (scale > 0 && scale < FIREWORK_SPRITE_MIN_SCALE) {
          this.drawWedgesVector(ctx, position.x, position.y, scale, rotation);
        } else if (scale > 0) {
          const drawHalf = half * (scale / FIREWORK_SCALE_PEAK);
          ctx.save();
          ctx.translate(position.x, position.y);
          ctx.rotate(rotation);
          ctx.drawImage(this.getWedgeImage(), -drawHalf, -drawHalf, drawHalf * 2, drawHalf * 2);
          ctx.restore();
        }
        this.drawFireworkBalls(ctx, position.x, position.y, tSec - 0.1);
        return;
      }
      const backingScale = this.getBackingScale();
      const sizePx = Math.max(2, Math.ceil(half * 2 * backingScale));
      const scratch = this.acquireFireworkScratch(sizePx);
      scratch.setTransform(backingScale, 0, 0, backingScale, sizePx / 2, sizePx / 2);
      scratch.rotate(rotation);
      scratch.drawImage(this.getWedgeImage(), -half, -half, half * 2, half * 2);
      scratch.rotate(-rotation);
      this.drawFireworkBalls(scratch, 0, 0, tSec - 0.1);
      const outerR = this.context.radius / 4.5 * scale;
      const holeSpan = FIREWORK_END_SEC - FIREWORK_HOLE_START_SEC;
      const linearU = Math.min(1, (tSec - FIREWORK_HOLE_START_SEC) / holeSpan);
      const u = linearU * linearU * (3 - 2 * linearU);
      const solidR = outerR * (0.05 + u * 0.95);
      const totalR = solidR + outerR * 0.5;
      const maskAlpha = Math.min(1, linearU / 0.2);
      if (totalR > 0 && maskAlpha > 0) {
        scratch.globalCompositeOperation = "destination-out";
        scratch.globalAlpha = maskAlpha;
        const maskGrad = scratch.createRadialGradient(0, 0, 0, 0, 0, totalR);
        maskGrad.addColorStop(0, "rgba(0,0,0,1)");
        maskGrad.addColorStop(solidR / totalR, "rgba(0,0,0,1)");
        maskGrad.addColorStop(1, "rgba(0,0,0,0)");
        scratch.fillStyle = maskGrad;
        scratch.beginPath();
        scratch.arc(0, 0, totalR, 0, Math.PI * 2);
        scratch.fill();
        scratch.globalCompositeOperation = "source-over";
        scratch.globalAlpha = 1;
      }
      ctx.drawImage(this.fireworkScratch, position.x - half, position.y - half, half * 2, half * 2);
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/renderers/MainRenderer.ts
  var MAX_DPR = 2;
  var FULLSCREEN_MIN_DPR = 1;
  var STAR_TAP_ROTATION_SPEED_RAD_PER_MS = 2 * Math.PI / 1e3;
  var RENDER_PROFILE_STAGES = [
    "prepare",
    "clear",
    "judgeLine",
    "fireworks",
    "hud",
    "tracks",
    "slideStars",
    "approach",
    "heads",
    "touches",
    "effects",
    "total"
  ];
  var PROFILE_STAGE_INDEX = Object.fromEntries(
    RENDER_PROFILE_STAGES.map((stage, index) => [stage, index])
  );
  var EMPTY_TIME_WINDOW_INDEX = { timingMs: [], prefixMaxEndMs: [] };
  function buildTimeWindowIndex(items, getTimingMs, getEndMs) {
    const n2 = items.length;
    const timingMs = new Array(n2);
    const prefixMaxEndMs = new Array(n2);
    let maxEnd = -Infinity;
    for (let i2 = 0; i2 < n2; i2++) {
      timingMs[i2] = getTimingMs(items[i2]);
      const end = getEndMs(items[i2]);
      if (end > maxEnd) maxEnd = end;
      prefixMaxEndMs[i2] = maxEnd;
    }
    return { timingMs, prefixMaxEndMs };
  }
  function windowRange(index, nowMs, lookAheadMs) {
    const { timingMs, prefixMaxEndMs } = index;
    const limit = nowMs + lookAheadMs;
    let lo = 0;
    let hi = timingMs.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (timingMs[mid] <= limit) lo = mid + 1;
      else hi = mid;
    }
    const end = lo;
    lo = 0;
    hi = end;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (prefixMaxEndMs[mid] < nowMs) lo = mid + 1;
      else hi = mid;
    }
    return [lo, end];
  }
  function slideVisibleEndMs(note) {
    const pathCount = note.allSlideSegments?.length ?? 1;
    let end = note.timingMs;
    for (let i2 = 0; i2 < pathCount; i2++) {
      const delayMs = note.allDelayMs?.[i2] ?? note.delayMs ?? 6e4 / note.bpm;
      const durationMs = note.allDurationMs?.[i2] ?? note.durationMs ?? 0;
      const pathEnd = note.timingMs + delayMs + durationMs;
      if (pathEnd > end) end = pathEnd;
    }
    return end;
  }
  function layeredHeadEndMs(item) {
    if (item.kind === "hold") {
      return item.note.timingMs + 6e4 * item.note.duration / item.note.bpm;
    }
    return item.note.timingMs + NOTE_VISIBILITY_AFTER_MS;
  }
  function touchVisibleEndMs(note) {
    const holdMs = note.type === "touch-hold-start" ? note.durationMs : 0;
    return note.timingMs + holdMs + 50;
  }
  var EMPTY_RENDER_NOTE_META = {
    simultaneousNoteCount: 0,
    simultaneousSlideCount: 0,
    simultaneousNonTouchCount: 0,
    simultaneousTouchCount: 0
  };
  var MainRenderer = class {
    /**
     * @throws {Error} 无法获取 Canvas 2D 绘图上下文时抛出
     */
    constructor(canvas2, config = {}) {
      this.centerX = 0;
      this.centerY = 0;
      this.radius = 0;
      this.logicalSize = 0;
      this.fullscreenMaxPixels = 25e5;
      this.config = {
        hiSpeed: HI_SPEED_DEFAULT * HI_SPEED_CONVERSION_FACTOR,
        alwaysKeepHiSpeed: false,
        slideDelay: 0,
        playbackSpeed: 1,
        mirrorMode: "none",
        highlightExNotes: false,
        normalColorBreakSlide: false,
        pinkSlideStart: false,
        slideRotation: false,
        judgmentLineDesign: "simple",
        showBpm: true,
        showNoteTotal: true,
        showBreakCount: true,
        showBreakIndex: false,
        rainbowBpm: false,
        ddrColorMode: false,
        ddrColorExtended: false,
        showFireworks: true,
        showHitEffect: true
      };
      // 本地补丁：见 setHudLabels。默认保留上游写死的中文。re-sync 时须重打。
      this.hudLabels = { combo: "\u8FDE\u51FB", breakNoEx: "\u65E0\u4FDD\u62A4" };
      this.fps = 0;
      this.prevBpm = 120;
      this.bpmChangeTime = 0;
      this.bpmChangeType = null;
      this.isPlaying = false;
      this.beatDisplayInfo = null;
      this.touchDrawOrder = new TouchDrawOrder();
      this.sensorImage = null;
      this.backgroundVideo = null;
      this.backgroundVideoCache = null;
      this.backgroundVideoCacheReady = false;
      this.backgroundVideoSrc = "";
      // 本地补丁：无 PV 的谱面用封面图当圆盘背景，上游只支持视频。re-sync 时须重打。
      this.backgroundImage = null;
      this.timingTimelineChart = null;
      this.timingTimeline = null;
      // 缓存预处理好的 Note 数据。
      // 同押计数和 Break 序号只依赖 chart 本身，以 notes 数组引用为缓存键，切谱时自然失效。
      this.preparedNotesRef = null;
      this.preparedRenderNotes = {
        slides: [],
        touches: [],
        fireworkTouches: [],
        holds: [],
        holdEffectNotes: [],
        touchHoldNotes: [],
        holdEndMap: /* @__PURE__ */ new Map(),
        noteMeta: /* @__PURE__ */ new WeakMap(),
        approachGroups: [],
        layeredHeads: [],
        hitEffectNotes: [],
        noteCompletionTimes: [],
        breakCompletionTimes: [],
        breakNoExCompletionTimes: [],
        slideIndex: EMPTY_TIME_WINDOW_INDEX,
        touchIndex: EMPTY_TIME_WINDOW_INDEX,
        layeredIndex: EMPTY_TIME_WINDOW_INDEX,
        approachIndex: EMPTY_TIME_WINDOW_INDEX,
        holdEffectIndex: EMPTY_TIME_WINDOW_INDEX,
        touchHoldIndex: EMPTY_TIME_WINDOW_INDEX,
        minHiSpeed: 1
      };
      this.visibleTouchCountByPos = /* @__PURE__ */ new Map();
      this.visibleApproachIndicators = [];
      this.pendingTapArcs = [];
      this.pendingStableTracks = [];
      this.profilingEnabled = false;
      this.profileSumMs = new Float64Array(RENDER_PROFILE_STAGES.length);
      this.profileMaxMs = new Float64Array(RENDER_PROFILE_STAGES.length);
      this.profileLastMs = new Float64Array(RENDER_PROFILE_STAGES.length);
      this.profileFrames = 0;
      this.profileFrameStartMs = 0;
      this.profileStageStartMs = 0;
      this.canvas = canvas2;
      this.sensorImagePath = config.sensorImagePath ?? "/assets/maimai/chart/sensor.webp";
      if (config.showStatistics === false) {
        this.config.showBpm = false;
        this.config.showNoteTotal = false;
        this.config.showBreakCount = false;
      }
      const context = canvas2.getContext("2d", { alpha: false });
      if (!context) {
        throw new Error("Failed to get 2D canvas context");
      }
      this.ctx = context;
      this.resize();
      this.initRenderers();
      this.loadAssets();
    }
    initRenderers() {
      const context = this.createRenderContext();
      this.noteRenderer = new NoteRenderer(context);
      this.slideRenderer = new SlideRenderer(context, this.noteRenderer);
      this.holdRenderer = new HoldRenderer(context);
      this.touchRenderer = new TouchRenderer(context);
      this.holdEffectRenderer = new HoldEffectRenderer(context);
      this.touchHitEffectRenderer = new TouchHitEffectRenderer(context);
      this.touchFireworkRenderer = new TouchFireworkRenderer(context);
      this.tapHitEffectRenderer = new TapHitEffectRenderer(context);
    }
    createRenderContext() {
      return {
        canvas: this.canvas,
        ctx: this.ctx,
        centerX: this.centerX,
        centerY: this.centerY,
        radius: this.radius,
        hiSpeed: this.config.hiSpeed,
        baseApproachTimeMs: BASE_APPROACH_TIME_MS,
        config: this.config
      };
    }
    updateRenderersContext() {
      const context = this.createRenderContext();
      this.noteRenderer.updateContext(context);
      this.slideRenderer.updateContext(context);
      this.holdRenderer.updateContext(context);
      this.touchRenderer.updateContext(context);
      this.holdEffectRenderer.updateContext(context);
      this.touchHitEffectRenderer.updateContext(context);
      this.touchFireworkRenderer.updateContext(context);
      this.tapHitEffectRenderer.updateContext(context);
    }
    loadAssets() {
      this.sensorImage = new Image();
      this.sensorImage.src = this.sensorImagePath;
    }
    /**
     * 随父容器更新画布尺寸与变换矩阵。全屏时受 fullscreenMaxPixels 像素上限压制 DPR。
     */
    resize(isFullscreen = false) {
      const parent = this.canvas.parentElement;
      if (!parent) return;
      this.canvas.style.width = "";
      this.canvas.style.height = "";
      const rect = parent.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      if (size <= 0) return;
      const rawDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const fullscreenBudgetDpr = Math.sqrt(this.fullscreenMaxPixels / (size * size));
      const dpr = isFullscreen ? Math.min(rawDpr, Math.max(FULLSCREEN_MIN_DPR, fullscreenBudgetDpr)) : rawDpr;
      const backingSize = Math.round(size * dpr);
      const effectiveDpr = backingSize / size;
      this.applySize(size, effectiveDpr);
    }
    /** 离屏测试或 GIF 导出等脱离 DOM 的场景：size 为逻辑边长，dpr 决定实际像素。 */
    resizeToSize(size, dpr = 1) {
      this.applySize(size, dpr);
    }
    applySize(logicalSize, dpr) {
      this.logicalSize = logicalSize;
      this.canvas.width = Math.round(logicalSize * dpr);
      this.canvas.height = Math.round(logicalSize * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.centerX = logicalSize / 2;
      this.centerY = logicalSize / 2;
      this.radius = logicalSize * 0.45;
      if (this.noteRenderer) {
        this.updateRenderersContext();
      }
    }
    /** 渲染当前节拍的单帧画面（背景、判定线、HUD、Note、烟花与特效）。 */
    renderFrame(chart2, currentBeats2, beatsPerMeasure) {
      this.profileBegin();
      const prepared = this.getPreparedRenderNotes(chart2.notes);
      const timingTimeline = this.getTimingTimeline(chart2);
      const timing = {
        currentBeat: currentBeats2,
        currentTimeMs: timingTimeline.msFromBeat(currentBeats2),
        currentBpm: timingTimeline.bpmAtBeat(currentBeats2),
        divisor: timingTimeline.divisorAtBeat(currentBeats2)
      };
      const measure = Math.floor(currentBeats2 / beatsPerMeasure);
      const beatInMeasure = currentBeats2 - measure * beatsPerMeasure;
      const beat = Math.floor(beatInMeasure) + 1;
      const fraction = beatInMeasure - Math.floor(beatInMeasure);
      this.setBeatDisplayInfo(measure, beat, fraction, timing.divisor);
      this.profileMark("prepare");
      this.clear();
      this.profileMark("clear");
      this.renderJudgmentLine();
      this.profileMark("judgeLine");
      this.renderFireworks(prepared.fireworkTouches, timing);
      this.profileMark("fireworks");
      this.renderNotes(prepared, timing);
      this.profileEnd();
    }
    /** 设置 Note 流速（范围 [3, 9]），并同步更新子渲染器。 */
    setHiSpeed(hiSpeed) {
      if (hiSpeed >= 3 && hiSpeed <= 9) {
        this.config.hiSpeed = hiSpeed * HI_SPEED_CONVERSION_FACTOR;
        this.updateRenderersContext();
      }
    }
    setAlwaysKeepHiSpeed(alwaysKeepHiSpeed) {
      this.config.alwaysKeepHiSpeed = alwaysKeepHiSpeed;
      this.updateRenderersContext();
    }
    /** 设置 Slide 轨迹提前/延后显示的时机。限制在 [-1, 1] 且步长 0.1，同步更新子渲染器。 */
    setSlideDelay(slideDelay) {
      if (!Number.isFinite(slideDelay)) return;
      this.config.slideDelay = Math.round(Math.max(-1, Math.min(1, slideDelay)) * 10) / 10 || 0;
      this.updateRenderersContext();
    }
    // 本地补丁：上游上限 1.0（只做减速练习），我们也允许 2.0 倍速跟打；
    // alwaysKeepHiSpeed 的补偿式 (base / (hi / speed)) 在 >1 时同样成立。
    // re-sync 时须重打。
    /** 设置回放速率（范围 [0.1, 2.0]），并同步更新子渲染器。 */
    setPlaybackSpeed(playbackSpeed2) {
      if (playbackSpeed2 >= 0.1 && playbackSpeed2 <= 2) {
        this.config.playbackSpeed = playbackSpeed2;
        this.updateRenderersContext();
      }
    }
    setFps(fps) {
      this.fps = fps;
    }
    setIsPlaying(isPlaying2) {
      this.isPlaying = isPlaying2;
    }
    setBeatDisplayInfo(measure, beat, fraction, divisor) {
      this.beatDisplayInfo = { measure, beat, fraction, divisor };
    }
    setHighlightExNotes(enabled) {
      this.config.highlightExNotes = enabled;
      this.updateRenderersContext();
    }
    setNormalColorBreakSlide(enabled) {
      this.config.normalColorBreakSlide = enabled;
      this.updateRenderersContext();
    }
    setPinkSlideStart(enabled) {
      this.config.pinkSlideStart = enabled;
      this.updateRenderersContext();
    }
    setSlideRotation(enabled) {
      this.config.slideRotation = enabled;
      this.updateRenderersContext();
    }
    setMirrorMode(mode) {
      this.config.mirrorMode = mode;
      this.updateRenderersContext();
    }
    setJudgmentLineDesign(design) {
      this.config.judgmentLineDesign = design;
      this.updateRenderersContext();
    }
    setShowFireworks(enabled) {
      this.config.showFireworks = enabled;
    }
    // 本地补丁：HUD 的两个计数上游只有默认开启、没有 setter，站点要把它们做成
    // 可关的设置项。re-sync 时须重打。
    setShowNoteTotal(enabled) {
      this.config.showNoteTotal = enabled;
    }
    setShowBreakCount(enabled) {
      this.config.showBreakCount = enabled;
    }
    /**
     * 本地补丁：HUD 文案本地化。上游把「连击」「无保护」直接写死在 fillText 里，
     * en/ja 用户会看到中文被烧进画面，连导出的 PNG/GIF 也一样。只覆盖传入的键，
     * 未传的沿用默认中文。re-sync 时须重打。
     */
    setHudLabels(labels) {
      this.hudLabels = { ...this.hudLabels, ...labels };
    }
    setShowHitEffect(enabled) {
      this.config.showHitEffect = enabled;
    }
    /**
     * 清空舞台并绘制判定线；背景视频行为与正常播放一致。
     * 供 hit-fx 预览等工具复用舞台素材，不要自行画圈/渐变。
     */
    renderEmptyStage() {
      this.clear();
      this.renderJudgmentLine();
    }
    /** 获取当前逻辑坐标系下的 RenderContext（在 resize 后有效）。 */
    getRenderContext() {
      return this.createRenderContext();
    }
    setFullscreenMaxPixels(maxPixels) {
      this.fullscreenMaxPixels = maxPixels;
    }
    /** 设置背景视频元素。视频源改变时会自动失效当前帧缓存。 */
    setBackgroundVideo(video) {
      if (video && video.src !== this.backgroundVideoSrc) {
        this.backgroundVideoSrc = video.src;
        this.backgroundVideoCacheReady = false;
      }
      this.backgroundVideo = video;
    }
    // 本地补丁：封面图背景 setter，与 setBackgroundVideo 配对。re-sync 时须重打。
    setBackgroundImage(image) {
      this.backgroundImage = image;
    }
    cacheBackgroundVideoFrame(video) {
      const w2 = video.videoWidth;
      const h2 = video.videoHeight;
      if (w2 === 0 || h2 === 0) return;
      let cache = this.backgroundVideoCache;
      if (!cache) {
        cache = document.createElement("canvas");
        this.backgroundVideoCache = cache;
      }
      if (cache.width !== w2 || cache.height !== h2) {
        cache.width = w2;
        cache.height = h2;
      }
      const cctx = cache.getContext("2d");
      if (!cctx) return;
      cctx.drawImage(video, 0, 0, w2, h2);
      this.backgroundVideoCacheReady = true;
    }
    // 本地补丁：视频/封面共用的圆盘背景绘制（上游把视频路径内联在 clear 里，
    // 抽出来才能给封面图复用）。re-sync 时须重打。
    drawBackgroundSource(source, sourceWidth, sourceHeight) {
      const s2 = this.logicalSize;
      this.ctx.fillStyle = COLORS.BLACK;
      this.ctx.fillRect(0, 0, s2, s2);
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, s2 / 2, 0, Math.PI * 2);
      this.ctx.clip();
      const scale = Math.min(s2 / sourceWidth, s2 / sourceHeight);
      const dw = sourceWidth * scale;
      const dh = sourceHeight * scale;
      this.ctx.drawImage(source, (s2 - dw) / 2, (s2 - dh) / 2, dw, dh);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      this.ctx.fillRect(0, 0, s2, s2);
      this.ctx.restore();
    }
    /**
     * 清空画布并绘制背景底色、当前背景视频帧或封面图（本地补丁：封面回落）。
     *
     * fillRect 保证导出的背景不透明。
     * clearRect 依赖 alpha:false，移动端 Safari 不可靠，会导致导出图透明。
     */
    clear() {
      const video = this.backgroundVideo;
      if (video && video.videoWidth > 0) {
        let source = null;
        if (video.readyState >= 2) {
          this.cacheBackgroundVideoFrame(video);
          source = video;
        } else if (this.backgroundVideoCacheReady) {
          source = this.backgroundVideoCache;
        }
        if (source) {
          this.drawBackgroundSource(source, video.videoWidth, video.videoHeight);
          return;
        }
      }
      const image = this.backgroundImage;
      if (image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        this.drawBackgroundSource(image, image.naturalWidth, image.naturalHeight);
        return;
      }
      const s2 = this.logicalSize;
      this.ctx.fillStyle = COLORS.BLACK;
      this.ctx.fillRect(0, 0, s2, s2);
    }
    /** 绘制判定线圆环与各按键点。blind 模式跳过绘制。 */
    renderJudgmentLine() {
      if (this.config.judgmentLineDesign === "blind") {
        return;
      }
      this.ctx.save();
      if (this.config.judgmentLineDesign === "sensor" && this.sensorImage && this.sensorImage.complete) {
        const imgSize = this.logicalSize - 10;
        const imgX = this.centerX - imgSize / 2;
        const imgY = this.centerY - imgSize / 2 + 8;
        this.ctx.drawImage(this.sensorImage, imgX, imgY, imgSize, imgSize);
      }
      if (this.config.judgmentLineDesign === "simple" || this.config.judgmentLineDesign === "sensor") {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = COLORS.WHITE;
        this.ctx.lineWidth = JUDGMENT_LINE_WIDTH_RATIO * this.radius;
        this.ctx.stroke();
      }
      const markerSize = BUTTON_MARKER_RATIO * this.radius;
      for (let pos = 1; pos <= 8; pos++) {
        const buttonPos = this.noteRenderer.getPositionOnRing(pos);
        this.ctx.beginPath();
        this.ctx.arc(buttonPos.x, buttonPos.y, markerSize, 0, Math.PI * 2);
        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    // Touch 烟花在判定线上方、音符下方渲染，裁剪至舞台内切圆
    renderFireworks(touches, timing) {
      if (!this.config.showFireworks) return;
      if (touches.length === 0) return;
      this.touchFireworkRenderer.warmFireworkResources();
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.logicalSize / 2, 0, Math.PI * 2);
      this.ctx.clip();
      this.touchFireworkRenderer.renderTouchFireworks(touches, timing.currentTimeMs);
      this.ctx.restore();
    }
    renderNotes(prepared, timing) {
      if (this.config.showBpm) {
        this.renderBpmDisplay(timing.currentBpm);
      }
      if (this.config.showNoteTotal || this.config.showBreakCount) {
        this.renderNoteCounts(prepared, timing.currentTimeMs);
      }
      this.profileMark("hud");
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, this.logicalSize / 2, 0, Math.PI * 2);
      this.ctx.clip();
      const {
        slides,
        touches,
        approachGroups,
        hitEffectNotes,
        layeredHeads,
        holdEffectNotes,
        holdEffectIndex,
        touchHoldNotes,
        touchHoldIndex,
        holdEndMap,
        noteMeta
      } = prepared;
      const nowMs = timing.currentTimeMs;
      const lookAheadMs = BASE_APPROACH_TIME_MS / this.config.hiSpeed / prepared.minHiSpeed;
      const [slideLo, slideHi] = windowRange(prepared.slideIndex, nowMs, lookAheadMs);
      const layerTracks = this.pendingStableTracks;
      layerTracks.length = 0;
      for (let i2 = slideHi - 1; i2 >= slideLo; i2--) {
        layerTracks.push({
          note: slides[i2],
          index: i2,
          isSimultaneous: this.getNoteMeta(noteMeta, slides[i2]).simultaneousSlideCount >= 2
        });
      }
      this.slideRenderer.renderStableTracks(
        layerTracks,
        timing.currentBeat,
        timing.currentTimeMs,
        !this.isPlaying
      );
      this.profileMark("tracks");
      for (let i2 = slideHi - 1; i2 >= slideLo; i2--) {
        this.slideRenderer.renderSlide(
          slides[i2],
          timing.currentBeat,
          timing.currentTimeMs,
          "stars",
          this.getNoteMeta(noteMeta, slides[i2]).simultaneousSlideCount >= 2
        );
      }
      this.profileMark("slideStars");
      const [groupLo, groupHi] = windowRange(prepared.approachIndex, nowMs, lookAheadMs);
      this.renderApproachIndicators(approachGroups, groupLo, groupHi, noteMeta, timing);
      const [headLo, headHi] = windowRange(prepared.layeredIndex, nowMs, lookAheadMs);
      this.renderTapApproachArcs(layeredHeads, headLo, headHi, noteMeta, timing);
      this.profileMark("approach");
      this.renderLayeredHeads(layeredHeads, headLo, headHi, holdEndMap, noteMeta, timing);
      this.profileMark("heads");
      const [touchLo, touchHi] = windowRange(prepared.touchIndex, nowMs, lookAheadMs);
      this.renderTouchBorders(touches, touchLo, touchHi, noteMeta, timing.currentTimeMs);
      const touchCommands = [];
      for (let i2 = touchHi - 1; i2 >= touchLo; i2--) {
        this.touchRenderer.renderTouch(
          touches[i2],
          timing.currentBeat,
          timing.currentTimeMs,
          this.getNoteMeta(noteMeta, touches[i2]).simultaneousNoteCount >= 2,
          touchCommands,
          this.getNoteMeta(noteMeta, touches[i2]).sourceNoteIndex
        );
      }
      flushTouchDrawCommands(touchCommands, this.touchDrawOrder);
      this.profileMark("touches");
      if (this.config.showHitEffect) {
        const [holdLo, holdHi] = windowRange(holdEffectIndex, nowMs, lookAheadMs);
        const [touchHoldLo, touchHoldHi] = windowRange(touchHoldIndex, nowMs, lookAheadMs);
        this.holdEffectRenderer.renderHoldPressEffects(
          holdEffectNotes,
          holdEndMap,
          timing.currentTimeMs,
          (position, holdStartTiming) => this.getHoldEndKey(position, holdStartTiming),
          void 0,
          holdLo,
          holdHi
        );
        this.renderTouchHoldPressEffects(
          touchHoldNotes,
          timing.currentTimeMs,
          touchHoldLo,
          touchHoldHi
        );
        this.renderTouchHoldReleaseEffects(
          touchHoldNotes,
          timing.currentTimeMs,
          touchHoldLo,
          touchHoldHi
        );
        this.touchHitEffectRenderer.renderTouchHitEffects(touches, timing.currentTimeMs);
        this.renderTapHitEffect(hitEffectNotes, timing.currentTimeMs);
      }
      this.profileMark("effects");
      this.ctx.restore();
    }
    /** 供基准测试和回归测试调用，检查 Tap 精灵图裁剪是否越界（实现见 NoteRenderer）。 */
    validateSpriteCrops() {
      return this.noteRenderer.validateTapSpriteCrops();
    }
    /**
     * 开关分阶段计时。关闭时各打点仅剩布尔判断并清空累计数据；开启后由 takeFrameProfile 消费。
     */
    setProfilingEnabled(enabled) {
      this.profilingEnabled = enabled;
      if (!enabled) this.resetProfile();
    }
    /**
     * 取出并清空累计的分阶段耗时。未开启计时或期间未渲染返回 null，调用方应沿用上一份结果。
     */
    takeFrameProfile() {
      if (!this.profilingEnabled || this.profileFrames === 0) return null;
      const frames = this.profileFrames;
      const avgMs = {};
      const maxMs = {};
      for (let i2 = 0; i2 < RENDER_PROFILE_STAGES.length; i2++) {
        const stage = RENDER_PROFILE_STAGES[i2];
        avgMs[stage] = this.profileSumMs[i2] / frames;
        maxMs[stage] = this.profileMaxMs[i2];
      }
      this.resetProfile();
      return { frames, avgMs, maxMs };
    }
    /**
     * 最近一帧 renderFrame 各阶段耗时（ms），不受 takeFrameProfile 清零影响，供与 rAF 间隔配对。未开启返回 null。
     */
    getLastFrameProfile() {
      if (!this.profilingEnabled) return null;
      const result = {};
      for (let i2 = 0; i2 < RENDER_PROFILE_STAGES.length; i2++) {
        result[RENDER_PROFILE_STAGES[i2]] = this.profileLastMs[i2];
      }
      return result;
    }
    resetProfile() {
      this.profileSumMs.fill(0);
      this.profileMaxMs.fill(0);
      this.profileFrames = 0;
    }
    profileBegin() {
      if (!this.profilingEnabled) return;
      const now2 = performance.now();
      this.profileFrameStartMs = now2;
      this.profileStageStartMs = now2;
    }
    // 记录上一计时点到现在的阶段耗时，并推进计时点
    profileMark(stage) {
      if (!this.profilingEnabled) return;
      const now2 = performance.now();
      this.profileRecord(PROFILE_STAGE_INDEX[stage], now2 - this.profileStageStartMs);
      this.profileStageStartMs = now2;
    }
    profileEnd() {
      if (!this.profilingEnabled) return;
      this.profileRecord(PROFILE_STAGE_INDEX.total, performance.now() - this.profileFrameStartMs);
      this.profileFrames++;
    }
    profileRecord(index, durationMs) {
      this.profileSumMs[index] += durationMs;
      this.profileLastMs[index] = durationMs;
      if (durationMs > this.profileMaxMs[index]) this.profileMaxMs[index] = durationMs;
    }
    getPreparedRenderNotes(notes) {
      if (this.preparedNotesRef !== notes) {
        this.preparedRenderNotes = this.prepareRenderNotes(notes);
        this.preparedNotesRef = notes;
      }
      return this.preparedRenderNotes;
    }
    calculateSimultaneousCounts(notes, noteMeta) {
      const byTiming = /* @__PURE__ */ new Map();
      for (const note of notes) {
        if (isHoldEndNote(note) || note.hasDelayMarker) continue;
        const key = note.timingMs.toFixed(3);
        if (!byTiming.has(key)) {
          byTiming.set(key, []);
        }
        byTiming.get(key).push(note);
      }
      for (const [, group] of byTiming) {
        const tapCount = group.filter((n2) => !isTapNote(n2) || n2.type !== "break").length;
        const breakCount = group.filter(
          (n2) => n2.type === "break" || isSlideNote(n2) && n2.isStartBreak || isHoldStartNote(n2) && n2.isBreakHold
        ).length;
        const slideCount = group.filter((n2) => isSlideNote(n2)).length;
        const nonTouchCount = group.filter(
          (n2) => !isTouchNote(n2) && !isTouchHoldStartNote(n2) && n2.type !== "break"
        ).length;
        const touchByPos = /* @__PURE__ */ new Map();
        for (const note of group) {
          if (isTouchNote(note) || isTouchHoldStartNote(note)) {
            const pos = note.position;
            touchByPos.set(pos, (touchByPos.get(pos) || 0) + 1);
          }
        }
        for (const note of group) {
          const isSimultaneous = tapCount >= 2 || breakCount >= 1 && tapCount >= 1;
          const meta = this.getOrCreateNoteMeta(noteMeta, note);
          meta.simultaneousNoteCount = isSimultaneous ? Math.max(2, tapCount) : tapCount;
          meta.simultaneousSlideCount = slideCount;
          meta.simultaneousNonTouchCount = nonTouchCount;
          if (isTouchNote(note) || isTouchHoldStartNote(note)) {
            meta.simultaneousTouchCount = touchByPos.get(note.position) || 1;
          }
        }
      }
    }
    assignBreakIndices(notes, noteMeta) {
      const breakNotes = notes.filter(
        (n2) => (n2.type === "break" || isSlideNote(n2) && n2.isStartBreak || isHoldStartNote(n2) && n2.isBreakHold) && !n2.isEx
      ).sort((a2, b2) => a2.timingMs - b2.timingMs);
      let index = 1;
      for (const note of breakNotes) {
        this.getOrCreateNoteMeta(noteMeta, note).noExBreakIndex = index++;
      }
    }
    getNoteMeta(noteMeta, note) {
      return noteMeta.get(note) ?? EMPTY_RENDER_NOTE_META;
    }
    getOrCreateNoteMeta(noteMeta, note) {
      let meta = noteMeta.get(note);
      if (!meta) {
        meta = {
          simultaneousNoteCount: 0,
          simultaneousSlideCount: 0,
          simultaneousNonTouchCount: 0,
          simultaneousTouchCount: 0
        };
        noteMeta.set(note, meta);
      }
      return meta;
    }
    prepareRenderNotes(notes) {
      this.slideRenderer.invalidateTrackLayer();
      const slides = [];
      const touches = [];
      const fireworkTouches = [];
      const holds = [];
      const taps = [];
      const holdEndMap = /* @__PURE__ */ new Map();
      const noteMeta = /* @__PURE__ */ new WeakMap();
      const hitEffectNotes = [];
      const noteCompletionTimes = [];
      const breakCompletionTimes = [];
      const breakNoExCompletionTimes = [];
      for (let i2 = notes.length - 1; i2 >= 0; i2--) {
        const note = notes[i2];
        if (isSlideNote(note)) {
          slides.push(note);
        } else if (isTouchNote(note) || isTouchHoldStartNote(note)) {
          touches.push(note);
        } else if (isHoldStartNote(note)) {
          holds.push(note);
        } else if (isTapNote(note) && !isHoldEndNote(note)) {
          taps.push(note);
        }
      }
      for (const [note, sourceNoteIndex] of prepareTouchSourceIndices(notes)) {
        this.getOrCreateNoteMeta(noteMeta, note).sourceNoteIndex = sourceNoteIndex;
      }
      this.calculateSimultaneousCounts(notes, noteMeta);
      this.assignBreakIndices(notes, noteMeta);
      for (const note of notes) {
        if (isTapNote(note) || isHoldEndNote(note) || isSlideNote(note) && !note.isHeadless || isTouchNote(note) || note.type === "touch-hold-end") {
          noteCompletionTimes.push(note.timingMs);
        }
        if (isHoldEndNote(note)) {
          holdEndMap.set(this.getHoldEndKey(note.position, note.holdStartTiming), note);
        }
        if ((isTouchNote(note) || isTouchHoldStartNote(note)) && note.hasFirework) {
          fireworkTouches.push(note);
        }
        if (isSlideNote(note)) {
          const pathCount = note.allSlideSegments?.length ?? 1;
          for (let i2 = 0; i2 < pathCount; i2++) {
            const pathDelayMs = note.allDelayMs?.[i2] ?? note.delayMs ?? 0;
            const pathDurationMs = note.allDurationMs?.[i2] ?? note.durationMs ?? 0;
            noteCompletionTimes.push(note.timingMs + pathDelayMs + pathDurationMs);
          }
        }
        const isBreak = note.type === "break" || isSlideNote(note) && note.isStartBreak || isHoldStartNote(note) && note.isBreakHold;
        if (isBreak) {
          breakCompletionTimes.push(note.timingMs);
          if (!note.isEx) {
            breakNoExCompletionTimes.push(note.timingMs);
          }
        }
        if (isSlideNote(note) && note.allSlideBreaks) {
          for (let i2 = 0; i2 < note.allSlideBreaks.length; i2++) {
            if (note.allSlideBreaks[i2]) {
              const pathDelayMs = note.allDelayMs?.[i2] ?? note.delayMs ?? 0;
              const pathDurationMs = note.allDurationMs?.[i2] ?? note.durationMs ?? 0;
              breakCompletionTimes.push(note.timingMs + pathDelayMs + pathDurationMs);
            }
          }
        }
        if (isButtonNote(note) && !isTouchNote(note) && !isTouchHoldStartNote(note) && !isHoldStartNote(note) && !(isSlideNote(note) && note.isHeadless)) {
          hitEffectNotes.push(note);
        }
      }
      hitEffectNotes.sort((a2, b2) => a2.timingMs - b2.timingMs);
      noteCompletionTimes.sort((a2, b2) => a2 - b2);
      breakCompletionTimes.sort((a2, b2) => a2 - b2);
      breakNoExCompletionTimes.sort((a2, b2) => a2 - b2);
      const layeredHeads = [
        ...taps.map((note) => ({ kind: "tap", note })),
        ...holds.map((note) => ({ kind: "hold", note })),
        ...slides.filter((note) => !note.isHeadless).map((note) => ({ kind: "slideStart", note }))
      ];
      layeredHeads.sort((a2, b2) => b2.note.timingMs - a2.note.timingMs);
      const approachGroups = this.prepareApproachGroups(holds, slides);
      slides.sort((a2, b2) => b2.timingMs - a2.timingMs);
      slides.reverse();
      touches.sort((a2, b2) => b2.timingMs - a2.timingMs);
      touches.reverse();
      layeredHeads.reverse();
      approachGroups.sort((a2, b2) => a2.timingMs - b2.timingMs);
      fireworkTouches.sort((a2, b2) => fireworkTriggerMs(a2) - fireworkTriggerMs(b2));
      const timingOf = (note) => note.timingMs;
      const holdEffectNotes = [...holds].sort((a2, b2) => a2.timingMs - b2.timingMs);
      const touchHoldNotes = touches.filter(isTouchHoldStartNote);
      let minHiSpeed = 1;
      for (const note of notes) {
        if (note.hiSpeed === void 0) continue;
        const hs = Math.abs(note.hiSpeed);
        if (hs > 0 && hs < minHiSpeed) minHiSpeed = hs;
      }
      return {
        slides,
        touches,
        fireworkTouches,
        holds,
        holdEffectNotes,
        touchHoldNotes,
        holdEndMap,
        noteMeta,
        approachGroups,
        layeredHeads,
        hitEffectNotes,
        noteCompletionTimes,
        breakCompletionTimes,
        breakNoExCompletionTimes,
        minHiSpeed,
        slideIndex: buildTimeWindowIndex(slides, timingOf, slideVisibleEndMs),
        touchIndex: buildTimeWindowIndex(touches, timingOf, touchVisibleEndMs),
        layeredIndex: buildTimeWindowIndex(
          layeredHeads,
          (item) => item.note.timingMs,
          layeredHeadEndMs
        ),
        approachIndex: buildTimeWindowIndex(
          approachGroups,
          (group) => group.timingMs,
          (group) => group.timingMs
        ),
        holdEffectIndex: buildTimeWindowIndex(
          holdEffectNotes,
          (hold) => hold.timingMs,
          (hold) => {
            const holdEnd = holdEndMap.get(this.getHoldEndKey(hold.position, hold.timing));
            return holdEnd ? holdEnd.timingMs : hold.timingMs;
          }
        ),
        touchHoldIndex: buildTimeWindowIndex(
          touchHoldNotes,
          (note) => note.timingMs,
          // 覆盖按压波纹（到 Hold 尾）与尾部释放特效窗口
          (note) => note.timingMs + note.durationMs + NOTE_HIT_EFFECT_DURATION_MS
        )
      };
    }
    prepareApproachGroups(holds, slides) {
      const byTiming = /* @__PURE__ */ new Map();
      for (const hold of holds) {
        const key = hold.timingMs.toFixed(3);
        const group = byTiming.get(key);
        if (group) group.push({ kind: "hold", note: hold });
        else byTiming.set(key, [{ kind: "hold", note: hold }]);
      }
      for (const slide of slides) {
        if (slide.isHeadless) continue;
        const key = slide.timingMs.toFixed(3);
        const group = byTiming.get(key);
        if (group) group.push({ kind: "slide", note: slide });
        else byTiming.set(key, [{ kind: "slide", note: slide }]);
      }
      const groups = [];
      for (const notes of byTiming.values()) {
        groups.push({ timingMs: notes[0].note.timingMs, notes });
      }
      return groups;
    }
    renderApproachIndicators(groups, groupLo, groupHi, noteMeta, timing) {
      const visible = this.visibleApproachIndicators;
      for (let g = groupLo; g < groupHi; g++) {
        const group = groups[g];
        visible.length = 0;
        for (const item of group.notes) {
          let note;
          let pos;
          let color;
          if (item.kind === "hold") {
            note = item.note;
            pos = this.noteRenderer.calculateNotePosition(
              note,
              timing.currentBeat,
              timing.currentTimeMs
            );
            const isSimultaneous = this.getNoteMeta(noteMeta, note).simultaneousNoteCount >= 2;
            color = note.isBreakHold ? COLORS.BREAK_ORANGE : isSimultaneous ? COLORS.SIMULTANEOUS_GOLD : COLORS.TAP_PINK;
          } else {
            note = item.note;
            pos = this.slideRenderer.calculateSlideStartPosition(
              note,
              timing.currentBeat,
              timing.currentTimeMs
            );
            const isSimultaneous = this.getNoteMeta(noteMeta, note).simultaneousNoteCount >= 2;
            color = note.isStartBreak ? COLORS.BREAK_ORANGE : isSimultaneous ? COLORS.SIMULTANEOUS_GOLD : note.hasTapHead ? COLORS.TAP_PINK : COLORS.SLIDE_CYAN;
          }
          if (!pos.visible) continue;
          const timeDiff = note.timing - timing.currentBeat;
          if (timeDiff <= 0) continue;
          this.noteRenderer.renderApproachArc(note.position, pos.x, pos.y, color);
          visible.push({ note, position: pos });
        }
        if (visible.length >= 2) {
          const distance = Math.sqrt(
            Math.pow(visible[0].position.x - this.centerX, 2) + Math.pow(visible[0].position.y - this.centerY, 2)
          );
          for (let i2 = 0; i2 < visible.length; i2++) {
            for (let j2 = i2 + 1; j2 < visible.length; j2++) {
              this.noteRenderer.renderSimultaneousConnector(
                visible[i2].note.position,
                visible[j2].note.position,
                distance,
                COLORS.SIMULTANEOUS_GOLD
              );
            }
          }
        }
      }
    }
    renderSingleHold(hold, holdEndMap, noteMeta, timing) {
      const startPos = this.noteRenderer.calculateNotePosition(
        hold,
        timing.currentBeat,
        timing.currentTimeMs
      );
      if (!startPos.visible) return;
      const holdEnd = holdEndMap.get(this.getHoldEndKey(hold.position, hold.timing));
      if (!holdEnd) return;
      const endPos = this.noteRenderer.calculateNotePosition(
        holdEnd,
        timing.currentBeat,
        timing.currentTimeMs
      );
      const meta = this.getNoteMeta(noteMeta, hold);
      const isSimultaneous = meta.simultaneousNoteCount >= 2;
      const ddrColor = this.config.ddrColorMode ? this.getDdrColor(hold.timing) : null;
      const color = getGradientColors(ddrColor, hold.isBreakHold ?? false, isSimultaneous);
      this.holdRenderer.renderHold(
        startPos,
        endPos,
        hold.position,
        color,
        hold.isEx,
        hold,
        holdEnd,
        timing.currentTimeMs,
        hold.isBreakHold ?? false,
        isSimultaneous,
        this.exScale
      );
      if (this.config.showBreakIndex && hold.isBreakHold && meta.noExBreakIndex && !hold.isEx && startPos.visible) {
        this.noteRenderer.renderBreakIndex(
          startPos.x,
          startPos.y,
          startPos.scale,
          meta.noExBreakIndex
        );
      }
    }
    renderTouchBorders(touches, touchLo, touchHi, noteMeta, currentTimeMs) {
      const baseApproachTime = BASE_APPROACH_TIME_MS / this.config.hiSpeed;
      const visibleByPos = this.visibleTouchCountByPos;
      visibleByPos.clear();
      for (let i2 = touchLo; i2 < touchHi; i2++) {
        const touch = touches[i2];
        if (touch.type === "touch-hold-start") continue;
        const timeDiff = touch.timingMs - currentTimeMs;
        const approachTime = baseApproachTime / (Math.abs(touch.hiSpeed ?? 1) || 1);
        if (timeDiff <= approachTime && timeDiff >= -50) {
          const pos = touch.position;
          visibleByPos.set(pos, (visibleByPos.get(pos) || 0) + 1);
        }
      }
      for (let i2 = touchHi - 1; i2 >= touchLo; i2--) {
        const touch = touches[i2];
        const pos = this.touchRenderer.getTouchPosition(touch.position);
        const isSimultaneous = this.getNoteMeta(noteMeta, touch).simultaneousNoteCount >= 2;
        this.touchRenderer.renderTouchBorder(
          pos,
          isSimultaneous,
          visibleByPos.get(touch.position) || 0
        );
      }
    }
    renderSingleSlideStart(slide, noteMeta, currentBeat, currentTimeMs) {
      const pos = this.slideRenderer.calculateSlideStartPosition(slide, currentBeat, currentTimeMs);
      if (!pos.visible) return;
      const meta = this.getNoteMeta(noteMeta, slide);
      const isSimultaneous = meta.simultaneousNoteCount >= 2;
      if (slide.hasTapHead) {
        this.noteRenderer.renderTapNote(
          pos.x,
          pos.y,
          pos.scale,
          slide.position,
          slide.isStartBreak ?? false,
          isSimultaneous,
          slide.isEx ?? false,
          slide.timing,
          this.exScale
        );
      } else {
        const color = this.getStarHeadColor(
          slide.timing,
          slide.isStartBreak ?? false,
          isSimultaneous
        );
        const rotation = this.config.slideRotation ? this.slideRenderer.calculateStarRotation(slide, currentTimeMs) : 0;
        if (slide.isSplitSlide) {
          const noteSize = this.getStarNoteSize(pos.scale);
          if (slide.isEx) {
            this.slideRenderer.renderExSplitStarRing(
              pos.x,
              pos.y,
              noteSize,
              slide.isStartBreak ?? false,
              isSimultaneous,
              this.exScale
            );
          }
          this.renderSplitSlideStar(pos.x, pos.y, noteSize, color, rotation, slide.isEx ?? false);
        } else {
          this.renderStarHead(
            pos.x,
            pos.y,
            pos.scale,
            color,
            rotation,
            slide.isEx ?? false,
            slide.isStartBreak ?? false,
            isSimultaneous
          );
        }
      }
      if (this.config.showBreakIndex && slide.isStartBreak && meta.noExBreakIndex && !slide.isEx) {
        this.noteRenderer.renderBreakIndex(pos.x, pos.y, pos.scale, meta.noExBreakIndex);
      }
    }
    renderSplitSlideStar(x2, y2, size, color, rotation, isEx) {
      this.ctx.save();
      if (rotation !== 0) {
        this.ctx.translate(x2, y2);
        this.ctx.rotate(rotation);
        this.ctx.translate(-x2, -y2);
      }
      if (!isEx) {
        this.ctx.strokeStyle = COLORS.BLACK;
        this.ctx.lineWidth = 2 * this.radius / 300 * 3;
        for (const baseAngle of [-Math.PI / 2, Math.PI / 2]) {
          this.ctx.beginPath();
          for (let i2 = 0; i2 < 10; i2++) {
            const angle = i2 * Math.PI / 5 + baseAngle;
            const r2 = i2 % 2 === 0 ? size : size * 0.5;
            const px = x2 + Math.cos(angle) * r2;
            const py = y2 + Math.sin(angle) * r2;
            if (i2 === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
      const drawStarHalf = (baseAngle) => {
        const outerR = size;
        const innerR = size * 0.5;
        const outerHoleR = outerR * 0.55;
        const innerHoleR = innerR * 0.55;
        this.ctx.beginPath();
        for (let i2 = 0; i2 < 10; i2++) {
          const angle = i2 * Math.PI / 5 + baseAngle;
          const r2 = i2 % 2 === 0 ? outerR : innerR;
          const px = x2 + Math.cos(angle) * r2;
          const py = y2 + Math.sin(angle) * r2;
          if (i2 === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        for (let i2 = 9; i2 >= 0; i2--) {
          const angle = i2 * Math.PI / 5 + baseAngle;
          const r2 = i2 % 2 === 0 ? outerHoleR : innerHoleR;
          const px = x2 + Math.cos(angle) * r2;
          const py = y2 + Math.sin(angle) * r2;
          if (i2 === 9) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
      };
      drawStarHalf(-Math.PI / 2);
      drawStarHalf(Math.PI / 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.strokeStyle = COLORS.WHITE;
      this.ctx.lineWidth = 2 * this.radius / 300;
      this.ctx.beginPath();
      for (let i2 = 0; i2 < 10; i2++) {
        const angle = i2 * Math.PI / 5 - Math.PI / 2;
        const r2 = i2 % 2 === 0 ? size : size * 0.5;
        const px = x2 + Math.cos(angle) * r2;
        const py = y2 + Math.sin(angle) * r2;
        if (i2 === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.beginPath();
      for (let i2 = 0; i2 < 10; i2++) {
        const angle = i2 * Math.PI / 5 + Math.PI / 2;
        const r2 = i2 % 2 === 0 ? size : size * 0.5;
        const px = x2 + Math.cos(angle) * r2;
        const py = y2 + Math.sin(angle) * r2;
        if (i2 === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(x2, y2, size * 0.15, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.restore();
    }
    renderStarHead(x2, y2, scale, color, rotation, isEx, isBreak, isSimultaneous) {
      const noteSize = this.getStarNoteSize(scale);
      if (isEx) {
        this.slideRenderer.renderExStarRing(x2, y2, noteSize, isBreak, isSimultaneous, this.exScale);
      }
      this.slideRenderer.drawStar(x2, y2, noteSize, color, rotation, isEx);
    }
    get exScale() {
      return this.config.highlightExNotes ? 1.2 : 1;
    }
    getStarNoteSize(scale) {
      return this.radius / 12.5 * scale * 1.15 * 1.25;
    }
    getStarHeadColor(timing, isBreak, isSimultaneous) {
      if (this.config.ddrColorMode) {
        const ddrColor = this.getDdrColor(timing);
        if (ddrColor) return ddrColor;
      }
      if (isBreak) return COLORS.BREAK_ORANGE;
      if (isSimultaneous) return COLORS.SLIDE_SIMULTANEOUS;
      if (this.config.pinkSlideStart) return COLORS.SLIDE_PINK;
      return COLORS.SLIDE_CYAN;
    }
    // 按预排序好的时间分层顺序（早到达的后绘制以位于顶层）依次渲染 Tap、Hold、Slide 头部
    renderLayeredHeads(layered, headLo, headHi, holdEndMap, noteMeta, timing) {
      for (let i2 = headHi - 1; i2 >= headLo; i2--) {
        const item = layered[i2];
        if (item.kind === "tap")
          this.renderSingleTap(item.note, noteMeta, timing.currentBeat, timing.currentTimeMs);
        else if (item.kind === "hold") this.renderSingleHold(item.note, holdEndMap, noteMeta, timing);
        else
          this.renderSingleSlideStart(item.note, noteMeta, timing.currentBeat, timing.currentTimeMs);
      }
    }
    // Tap 接近弧共享圆心，整窗收集后按 (颜色, 拖影档) 合批 stroke，绘制调用次数与可见 Note 数无关
    renderTapApproachArcs(layered, headLo, headHi, noteMeta, timing) {
      const arcs = this.pendingTapArcs;
      arcs.length = 0;
      for (let i2 = headHi - 1; i2 >= headLo; i2--) {
        const item = layered[i2];
        if (item.kind !== "tap") continue;
        const tap = item.note;
        if (tap.timingMs <= timing.currentTimeMs) continue;
        const pos = this.noteRenderer.calculateNotePosition(
          tap,
          timing.currentBeat,
          timing.currentTimeMs
        );
        if (!pos.visible) continue;
        const isSimultaneous = this.getNoteMeta(noteMeta, tap).simultaneousNoteCount >= 2;
        arcs.push({
          position: tap.position,
          distance: Math.hypot(pos.x - this.centerX, pos.y - this.centerY),
          color: this.getTapApproachColor(tap, isSimultaneous)
        });
      }
      this.noteRenderer.renderApproachArcsBatch(arcs);
    }
    renderSingleTap(tap, noteMeta, currentBeat, currentTimeMs) {
      const pos = this.noteRenderer.calculateNotePosition(tap, currentBeat, currentTimeMs);
      if (!pos.visible) return;
      const meta = this.getNoteMeta(noteMeta, tap);
      const isSimultaneous = meta.simultaneousNoteCount >= 2;
      if (tap.isStar) {
        this.renderStarTapNote(tap, pos.x, pos.y, pos.scale, isSimultaneous, currentTimeMs);
      } else {
        this.noteRenderer.renderTapNote(
          pos.x,
          pos.y,
          pos.scale,
          tap.position,
          tap.type === "break",
          isSimultaneous,
          tap.isEx ?? false,
          tap.timing,
          this.exScale
        );
      }
      if (this.config.showBreakIndex && tap.type === "break" && meta.noExBreakIndex && !tap.isEx) {
        this.noteRenderer.renderBreakIndex(pos.x, pos.y, pos.scale, meta.noExBreakIndex);
      }
    }
    getTapApproachColor(tap, isSimultaneous) {
      if (tap.type === "break") return COLORS.BREAK_ORANGE;
      if (isSimultaneous) return COLORS.SIMULTANEOUS_GOLD;
      if (tap.isStar) return COLORS.SLIDE_CYAN;
      return COLORS.TAP_PINK;
    }
    renderStarTapNote(tap, x2, y2, scale, isSimultaneous, currentTimeMs) {
      const rotation = tap.isSpinningStar ? -currentTimeMs * STAR_TAP_ROTATION_SPEED_RAD_PER_MS : 0;
      this.renderStarHead(
        x2,
        y2,
        scale,
        this.getStarHeadColor(tap.timing, tap.type === "break", isSimultaneous),
        rotation,
        tap.isEx ?? false,
        tap.type === "break",
        isSimultaneous
      );
    }
    // 绘制 Touch Hold 头～尾期间在传感器点的持续按压波纹特效，[startIndex, endIndex) 来自 touchHoldIndex 粗筛
    renderTouchHoldPressEffects(touchHolds, currentTimeMs, startIndex, endIndex) {
      for (let i2 = startIndex; i2 < endIndex; i2++) {
        const note = touchHolds[i2];
        const startMs = note.timingMs;
        const endMs = note.timingMs + note.durationMs;
        if (currentTimeMs < startMs || currentTimeMs >= endMs) continue;
        const origin = this.touchRenderer.getTouchPosition(note.position);
        this.holdEffectRenderer.renderPressRippleAt(
          origin.x,
          origin.y,
          startMs,
          endMs,
          currentTimeMs
        );
      }
    }
    // 绘制 Touch Hold 尾部在传感器点的释放命中特效，[startIndex, endIndex) 来自 touchHoldIndex 粗筛
    renderTouchHoldReleaseEffects(touchHolds, currentTimeMs, startIndex, endIndex) {
      for (let i2 = startIndex; i2 < endIndex; i2++) {
        const note = touchHolds[i2];
        const endMs = note.timingMs + note.durationMs;
        if (currentTimeMs < endMs || currentTimeMs >= endMs + NOTE_HIT_EFFECT_DURATION_MS) {
          continue;
        }
        const origin = this.touchRenderer.getTouchPosition(note.position);
        const angle = note.position === "C" ? TOUCH_HOLD_CENTRE_BURST_ANGLE : Math.atan2(this.centerY - origin.y, this.centerX - origin.x);
        this.tapHitEffectRenderer.renderHitEffectAt(
          origin.x,
          origin.y,
          angle,
          COLORS.HIT_EFFECT_GOLD,
          (currentTimeMs - endMs) / NOTE_HIT_EFFECT_DURATION_MS,
          "hexagon"
        );
      }
    }
    renderTapHitEffect(notes, currentTimeMs) {
      const windowStartMs = currentTimeMs - NOTE_HIT_EFFECT_DURATION_MS;
      let lo = 0;
      let hi = notes.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (notes[mid].timingMs < windowStartMs) lo = mid + 1;
        else hi = mid;
      }
      const lastHitTimingByPos = /* @__PURE__ */ new Map();
      for (let i2 = lo; i2 < notes.length; i2++) {
        const n2 = notes[i2];
        if (n2.timingMs > currentTimeMs) break;
        const cur = lastHitTimingByPos.get(n2.position);
        if (cur === void 0 || n2.timingMs > cur) {
          lastHitTimingByPos.set(n2.position, n2.timingMs);
        }
      }
      for (let i2 = lo; i2 < notes.length; i2++) {
        const note = notes[i2];
        if (note.timingMs > currentTimeMs) break;
        const latest = lastHitTimingByPos.get(note.position);
        if (latest !== void 0 && latest > note.timingMs) continue;
        const pos = this.tapHitEffectRenderer.calculateHitEffectPosition(note, currentTimeMs);
        if (!(0 <= pos.progress && pos.progress <= 1)) continue;
        this.tapHitEffectRenderer.renderTapHitEffect(
          pos.x,
          pos.y,
          note.position,
          COLORS.HIT_EFFECT_GOLD,
          pos.progress,
          // Hold 尾与 Slide 头自身类型非 break，需通过各自的标记判断是否展示 Break 星形特效
          note.type === "break" || isTapNote(note) && note.isStar || isHoldEndNote(note) && note.isBreakHold || isSlideNote(note) && note.isStartBreak ? "star" : "hexagon"
        );
      }
    }
    renderBpmDisplay(currentBpm) {
      const lastBpm = this.prevBpm;
      if (!this.isPlaying) {
        this.prevBpm = currentBpm;
        this.bpmChangeType = null;
        this.bpmChangeTime = 0;
      } else if (currentBpm !== lastBpm) {
        this.bpmChangeTime = Date.now();
        this.bpmChangeType = currentBpm > lastBpm ? "up" : "down";
        this.prevBpm = currentBpm;
      }
      const fontSize = Math.round(22 * this.radius / 300);
      const smallFontSize = Math.round(16 * this.radius / 300);
      const padding = Math.round(20 * this.radius / 300);
      const lineGap = Math.round(4 * this.radius / 300);
      this.ctx.save();
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      this.ctx.shadowOffsetX = 2 * this.radius / 300;
      this.ctx.shadowOffsetY = 2 * this.radius / 300;
      this.ctx.font = `bold ${fontSize}px sans-serif`;
      const bpmText = `BPM: ${Math.floor(currentBpm)}`;
      let bpmColor = COLORS.WHITE;
      const timeSinceChange = Date.now() - this.bpmChangeTime;
      const INSTANT_DURATION = 50;
      const FADE_DURATION = 500;
      if (this.isPlaying && timeSinceChange < FADE_DURATION && this.bpmChangeType) {
        if (this.bpmChangeType === "up") {
          const red = Math.round(255);
          const fadeProgress = Math.max(
            0,
            (timeSinceChange - INSTANT_DURATION) / (FADE_DURATION - INSTANT_DURATION)
          );
          const green = Math.round(255 * fadeProgress);
          const blue = Math.round(255 * fadeProgress);
          bpmColor = `rgb(${red}, ${green}, ${blue})`;
        } else if (this.bpmChangeType === "down") {
          const green = Math.round(255);
          const fadeProgress = Math.max(
            0,
            (timeSinceChange - INSTANT_DURATION) / (FADE_DURATION - INSTANT_DURATION)
          );
          const red = Math.round(255 * fadeProgress);
          const blue = Math.round(255 * fadeProgress);
          bpmColor = `rgb(${red}, ${green}, ${blue})`;
        }
      }
      if (this.config.rainbowBpm && this.isRoundBpm(currentBpm)) {
        const bpmMetrics = this.ctx.measureText(bpmText);
        const hue = Date.now() / 1e3 * RAINBOW_SPEED_DEG_PER_SEC % 360;
        const gradient = this.ctx.createLinearGradient(padding, 0, padding + bpmMetrics.width, 0);
        for (let i2 = 0; i2 <= 6; i2++) {
          const h2 = (hue + i2 * 51) % 360;
          gradient.addColorStop(i2 / 6, `hsl(${h2}, 100%, 60%)`);
        }
        this.ctx.fillStyle = gradient;
      } else {
        this.ctx.fillStyle = bpmColor;
      }
      this.ctx.fillText(bpmText, padding, padding);
      let currentY = padding + fontSize + lineGap;
      if (this.beatDisplayInfo) {
        const { measure, beat, fraction, divisor } = this.beatDisplayInfo;
        this.ctx.font = `bold ${smallFontSize}px sans-serif`;
        this.ctx.fillStyle = "#94a3b8";
        const fractionStr = Math.floor(fraction * 100).toString().padStart(2, "0");
        const beatText = `${measure}:${beat}.${fractionStr} [1/${divisor}]`;
        this.ctx.fillText(beatText, padding, currentY);
        currentY += smallFontSize + lineGap * 2;
      }
      if (this.fps > 0) {
        this.ctx.font = `bold ${smallFontSize}px sans-serif`;
        const fpsColor = this.fps >= 55 ? "#22c55e" : this.fps >= 30 ? "#eab308" : "#ef4444";
        this.ctx.fillStyle = fpsColor;
        this.ctx.fillText(`FPS: ${this.fps}`, padding, currentY);
      }
      this.ctx.restore();
    }
    isRoundBpm(bpm) {
      const rounded = Math.floor(bpm);
      return rounded > 0 && 3600 % rounded === 0;
    }
    renderNoteCounts(prepared, currentTimeMs) {
      const totalNotes = prepared.noteCompletionTimes.length;
      const completedNotes = this.countCompleted(prepared.noteCompletionTimes, currentTimeMs);
      const totalBreaks = prepared.breakCompletionTimes.length;
      const completedBreaks = this.countCompleted(prepared.breakCompletionTimes, currentTimeMs);
      const totalBreaksNoEx = prepared.breakNoExCompletionTimes.length;
      const completedBreaksNoEx = this.countCompleted(
        prepared.breakNoExCompletionTimes,
        currentTimeMs
      );
      const fontSize = Math.round(22 * this.radius / 300);
      const smallFontSize = Math.round(18 * this.radius / 300);
      const padding = Math.round(20 * this.radius / 300);
      const lineGap = Math.round(4 * this.radius / 300);
      this.ctx.save();
      this.ctx.font = `bold ${fontSize}px sans-serif`;
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      this.ctx.shadowOffsetX = 2 * this.radius / 300;
      this.ctx.shadowOffsetY = 2 * this.radius / 300;
      if (this.config.showNoteTotal) {
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.fillText(
          `${this.hudLabels.combo}: ${completedNotes} / ${totalNotes}`,
          this.logicalSize - padding,
          padding
        );
      }
      if (this.config.showBreakCount) {
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "bottom";
        this.ctx.font = `bold ${fontSize}px sans-serif`;
        this.ctx.fillStyle = COLORS.BREAK_ORANGE;
        this.ctx.fillText(
          `BREAK: ${completedBreaks} / ${totalBreaks}`,
          padding,
          this.logicalSize - padding
        );
        this.ctx.textAlign = "right";
        this.ctx.font = `bold ${fontSize}px sans-serif`;
        this.ctx.fillStyle = "#FFA500";
        const bottomY = this.logicalSize - padding;
        this.ctx.fillText(
          `BREAK: ${completedBreaksNoEx} / ${totalBreaksNoEx}`,
          this.logicalSize - padding,
          bottomY
        );
        this.ctx.font = `bold ${smallFontSize}px sans-serif`;
        this.ctx.fillText(
          this.hudLabels.breakNoEx,
          this.logicalSize - padding,
          bottomY - fontSize - lineGap
        );
      }
      this.ctx.restore();
    }
    countCompleted(sortedTimes, currentTimeMs) {
      let lo = 0;
      let hi = sortedTimes.length;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (sortedTimes[mid] <= currentTimeMs) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }
    getHoldEndKey(position, holdStartTiming) {
      return `${position}:${holdStartTiming}`;
    }
    getTimingTimeline(chart2) {
      if (this.timingTimelineChart !== chart2) {
        this.timingTimeline = TimingTimeline.fromChart(chart2);
        this.timingTimelineChart = chart2;
      }
      return this.timingTimeline;
    }
    getDdrColor(timing) {
      if (!this.config.ddrColorMode) return null;
      const epsilon = 1e-3;
      const frac = Math.abs(timing % 1);
      if (frac < epsilon || frac > 1 - epsilon) return COLORS.DDR_RED;
      if (Math.abs(timing % 0.5) < epsilon) return COLORS.DDR_BLUE;
      if (Math.abs(timing % 0.25) < epsilon) return COLORS.DDR_YELLOW;
      if (this.config.ddrColorExtended) {
        if (Math.abs(timing % 0.125) < epsilon) return COLORS.DDR_ORANGE;
        if (Math.abs(timing % (1 / 6)) < epsilon) return COLORS.DDR_CYAN;
      }
      return COLORS.DDR_GREEN;
    }
  };

  // ../adx-dl/packages/maimai-chart-engine/src/core/parser/Ma2Parser.ts
  var SLIDE_COMMANDS = /* @__PURE__ */ new Set([
    "SI_",
    "SCR",
    "SCL",
    "SXR",
    "SXL",
    "SUL",
    "SUR",
    "SV_",
    "SVP",
    "SF_",
    "SWF",
    "SSL",
    "SSR",
    "SLL",
    "SLR"
  ]);
  var RECORD_COMMANDS = /* @__PURE__ */ new Set(["TAP", "HLD", "STR", "TTP", "THO", ...SLIDE_COMMANDS]);

  // node_modules/.pnpm/ts-pattern@5.9.0/node_modules/ts-pattern/dist/index.js
  var t = /* @__PURE__ */ Symbol.for("@ts-pattern/matcher");
  var e = /* @__PURE__ */ Symbol.for("@ts-pattern/isVariadic");
  var n = "@ts-pattern/anonymous-select-key";
  var r = (t2) => Boolean(t2 && "object" == typeof t2);
  var i = (e2) => e2 && !!e2[t];
  var o = (n2, s2, c2) => {
    if (i(n2)) {
      const e2 = n2[t](), { matched: r2, selections: i2 } = e2.match(s2);
      return r2 && i2 && Object.keys(i2).forEach((t2) => c2(t2, i2[t2])), r2;
    }
    if (r(n2)) {
      if (!r(s2)) return false;
      if (Array.isArray(n2)) {
        if (!Array.isArray(s2)) return false;
        let t2 = [], r2 = [], u = [];
        for (const o2 of n2.keys()) {
          const s3 = n2[o2];
          i(s3) && s3[e] ? u.push(s3) : u.length ? r2.push(s3) : t2.push(s3);
        }
        if (u.length) {
          if (u.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
          if (s2.length < t2.length + r2.length) return false;
          const e2 = s2.slice(0, t2.length), n3 = 0 === r2.length ? [] : s2.slice(-r2.length), i2 = s2.slice(t2.length, 0 === r2.length ? Infinity : -r2.length);
          return t2.every((t3, n4) => o(t3, e2[n4], c2)) && r2.every((t3, e3) => o(t3, n3[e3], c2)) && (0 === u.length || o(u[0], i2, c2));
        }
        return n2.length === s2.length && n2.every((t3, e2) => o(t3, s2[e2], c2));
      }
      return Reflect.ownKeys(n2).every((e2) => {
        const r2 = n2[e2];
        return (e2 in s2 || i(u = r2) && "optional" === u[t]().matcherType) && o(r2, s2[e2], c2);
        var u;
      });
    }
    return Object.is(s2, n2);
  };
  var s = (e2) => {
    var n2, o2, u;
    return r(e2) ? i(e2) ? null != (n2 = null == (o2 = (u = e2[t]()).getSelectionKeys) ? void 0 : o2.call(u)) ? n2 : [] : Array.isArray(e2) ? c(e2, s) : c(Object.values(e2), s) : [];
  };
  var c = (t2, e2) => t2.reduce((t3, n2) => t3.concat(e2(n2)), []);
  function a(t2) {
    return Object.assign(t2, { optional: () => h(t2), and: (e2) => d(t2, e2), or: (e2) => y(t2, e2), select: (e2) => void 0 === e2 ? v(t2) : v(e2, t2) });
  }
  function h(e2) {
    return a({ [t]: () => ({ match: (t2) => {
      let n2 = {};
      const r2 = (t3, e3) => {
        n2[t3] = e3;
      };
      return void 0 === t2 ? (s(e2).forEach((t3) => r2(t3, void 0)), { matched: true, selections: n2 }) : { matched: o(e2, t2, r2), selections: n2 };
    }, getSelectionKeys: () => s(e2), matcherType: "optional" }) });
  }
  function d(...e2) {
    return a({ [t]: () => ({ match: (t2) => {
      let n2 = {};
      const r2 = (t3, e3) => {
        n2[t3] = e3;
      };
      return { matched: e2.every((e3) => o(e3, t2, r2)), selections: n2 };
    }, getSelectionKeys: () => c(e2, s), matcherType: "and" }) });
  }
  function y(...e2) {
    return a({ [t]: () => ({ match: (t2) => {
      let n2 = {};
      const r2 = (t3, e3) => {
        n2[t3] = e3;
      };
      return c(e2, s).forEach((t3) => r2(t3, void 0)), { matched: e2.some((e3) => o(e3, t2, r2)), selections: n2 };
    }, getSelectionKeys: () => c(e2, s), matcherType: "or" }) });
  }
  function p(e2) {
    return { [t]: () => ({ match: (t2) => ({ matched: Boolean(e2(t2)) }) }) };
  }
  function v(...e2) {
    const r2 = "string" == typeof e2[0] ? e2[0] : void 0, i2 = 2 === e2.length ? e2[1] : "string" == typeof e2[0] ? void 0 : e2[0];
    return a({ [t]: () => ({ match: (t2) => {
      let e3 = { [null != r2 ? r2 : n]: t2 };
      return { matched: void 0 === i2 || o(i2, t2, (t3, n2) => {
        e3[t3] = n2;
      }), selections: e3 };
    }, getSelectionKeys: () => [null != r2 ? r2 : n].concat(void 0 === i2 ? [] : s(i2)) }) });
  }
  function b(t2) {
    return true;
  }
  function w(t2) {
    return "number" == typeof t2;
  }
  function S(t2) {
    return "string" == typeof t2;
  }
  function j(t2) {
    return "bigint" == typeof t2;
  }
  var K = a(p(b));
  var O = a(p(b));
  var x = (t2) => Object.assign(a(t2), { startsWith: (e2) => {
    return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.startsWith(n2)))));
    var n2;
  }, endsWith: (e2) => {
    return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.endsWith(n2)))));
    var n2;
  }, minLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length >= t3))(e2))), length: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length === t3))(e2))), maxLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length <= t3))(e2))), includes: (e2) => {
    return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.includes(n2)))));
    var n2;
  }, regex: (e2) => {
    return x(d(t2, (n2 = e2, p((t3) => S(t3) && Boolean(t3.match(n2))))));
    var n2;
  } });
  var A = x(p(S));
  var N = (t2) => Object.assign(a(t2), { between: (e2, n2) => N(d(t2, ((t3, e3) => p((n3) => w(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 < t3))(e2))), gt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 > t3))(e2))), lte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 <= t3))(e2))), gte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 >= t3))(e2))), int: () => N(d(t2, p((t3) => w(t3) && Number.isInteger(t3)))), finite: () => N(d(t2, p((t3) => w(t3) && Number.isFinite(t3)))), positive: () => N(d(t2, p((t3) => w(t3) && t3 > 0))), negative: () => N(d(t2, p((t3) => w(t3) && t3 < 0))) });
  var P = N(p(w));
  var k = (t2) => Object.assign(a(t2), { between: (e2, n2) => k(d(t2, ((t3, e3) => p((n3) => j(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 < t3))(e2))), gt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 > t3))(e2))), lte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 <= t3))(e2))), gte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 >= t3))(e2))), positive: () => k(d(t2, p((t3) => j(t3) && t3 > 0))), negative: () => k(d(t2, p((t3) => j(t3) && t3 < 0))) });
  var T = k(p(j));
  var B = a(p(function(t2) {
    return "boolean" == typeof t2;
  }));
  var _ = a(p(function(t2) {
    return "symbol" == typeof t2;
  }));
  var W = a(p(function(t2) {
    return null == t2;
  }));
  var $ = a(p(function(t2) {
    return null != t2;
  }));
  var I = class extends Error {
    constructor(t2) {
      let e2;
      try {
        e2 = JSON.stringify(t2);
      } catch (n2) {
        e2 = t2;
      }
      super(`Pattern matching error: no pattern matches value ${e2}`), this.input = void 0, this.input = t2;
    }
  };
  var L = { matched: false, value: void 0 };
  function M(t2) {
    return new R(t2, L);
  }
  var R = class _R {
    constructor(t2, e2) {
      this.input = void 0, this.state = void 0, this.input = t2, this.state = e2;
    }
    with(...t2) {
      if (this.state.matched) return this;
      const e2 = t2[t2.length - 1], r2 = [t2[0]];
      let i2;
      3 === t2.length && "function" == typeof t2[1] ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
      let s2 = false, c2 = {};
      const u = (t3, e3) => {
        s2 = true, c2[t3] = e3;
      }, a2 = !r2.some((t3) => o(t3, this.input, u)) || i2 && !Boolean(i2(this.input)) ? L : { matched: true, value: e2(s2 ? n in c2 ? c2[n] : c2 : this.input, this.input) };
      return new _R(this.input, a2);
    }
    when(t2, e2) {
      if (this.state.matched) return this;
      const n2 = Boolean(t2(this.input));
      return new _R(this.input, n2 ? { matched: true, value: e2(this.input, this.input) } : L);
    }
    otherwise(t2) {
      return this.state.matched ? this.state.value : t2(this.input);
    }
    exhaustive(t2 = F) {
      return this.state.matched ? this.state.value : t2(this.input);
    }
    run() {
      return this.exhaustive();
    }
    returnType() {
      return this;
    }
    narrow() {
      return this;
    }
  };
  function F(t2) {
    throw new I(t2);
  }

  // ../adx-dl/packages/maimai-chart-engine/src/core/parser/SimaiParser.ts
  var INOTE_MARKERS = [
    "&inote_1=",
    "&inote_2=",
    "&inote_3=",
    "&inote_4=",
    "&inote_5=",
    "&inote_6=",
    "&inote_7="
    // 本地补丁：宴 (UTAGE) — 上游只到 6，re-sync 时须重打
  ];
  function hasChartDigit(text) {
    for (const char of text) {
      if (char >= "1" && char <= "8") return true;
    }
    return false;
  }
  function splitLines(text) {
    return text.split("\n").map((line) => line.endsWith("\r") ? line.slice(0, -1) : line);
  }
  function isWhitespace(char) {
    return char === " " || char === "	" || char === "\r" || char === "\n";
  }
  function isMultiDigitNote(noteStr) {
    if (noteStr.length < 2) return false;
    for (const char of noteStr) {
      if (char < "0" || char > "9") return false;
    }
    return true;
  }
  function getAvailableDifficulties(simaiText) {
    const available = {};
    const lowerSimaiText = simaiText.toLowerCase();
    for (let i2 = 0; i2 < INOTE_MARKERS.length; i2++) {
      if (lowerSimaiText.includes(INOTE_MARKERS[i2])) {
        available[i2 + 1] = true;
      }
    }
    if (Object.keys(available).length === 0) {
      const hasChartContent = hasChartDigit(
        splitLines(simaiText).filter((line) => !line.trimStart().startsWith("&")).join("")
      );
      if (hasChartContent) {
        available[4] = true;
      }
    }
    return available;
  }
  function parseSimaiChart(simaiText, difficulty) {
    if (!simaiText || typeof simaiText !== "string") {
      throw new Error("Invalid input: expected a non-empty string");
    }
    const lines = splitLines(simaiText);
    if (!lines.some((line) => line.startsWith("&"))) {
      throw new Error("Invalid simai format: expected & metadata lines (e.g. &title=, &inote_4=)");
    }
    const metadata = {
      bpm: Number.NaN,
      title: "",
      artist: "",
      designer: "",
      level: {},
      designers: {},
      availableDifficulties: {},
      inotes: {}
    };
    let currentInote = null;
    let currentInoteContent = [];
    try {
      for (let i2 = 0; i2 < lines.length; i2++) {
        const line = lines[i2];
        const trimmedLine = line.trim();
        const inoteMatch = trimmedLine.match(/^&inote_(\d)=(.*)$/i);
        if (inoteMatch) {
          if (currentInote !== null) {
            metadata.inotes[currentInote] = currentInoteContent.join("\n");
            metadata.availableDifficulties[currentInote] = true;
          }
          currentInote = parseInt(inoteMatch[1]);
          currentInoteContent = inoteMatch[2] ? [inoteMatch[2]] : [];
          continue;
        }
        if (currentInote !== null) {
          if (trimmedLine.startsWith("&") && !trimmedLine.startsWith("&inote")) {
            metadata.inotes[currentInote] = currentInoteContent.join("\n");
            metadata.availableDifficulties[currentInote] = true;
            currentInote = null;
            currentInoteContent = [];
            parseMetadataLine(trimmedLine, metadata);
          } else if (!trimmedLine.startsWith("&")) {
            currentInoteContent.push(line);
          }
          continue;
        }
        if (trimmedLine.startsWith("&")) {
          parseMetadataLine(trimmedLine, metadata);
        }
      }
      if (currentInote !== null) {
        metadata.inotes[currentInote] = currentInoteContent.join("\n");
        metadata.availableDifficulties[currentInote] = true;
      }
      let selectedDifficulty = difficulty;
      const availableDiffs2 = Object.keys(metadata.inotes).map(Number).sort((a2, b2) => b2 - a2);
      if (!selectedDifficulty && availableDiffs2.length > 0) {
        selectedDifficulty = availableDiffs2[0];
      }
      let chartBody = "";
      if (selectedDifficulty && metadata.inotes[selectedDifficulty]) {
        chartBody = metadata.inotes[selectedDifficulty];
      } else if (availableDiffs2.length === 0) {
        for (let i2 = 0; i2 < lines.length; i2++) {
          const line = lines[i2].trim();
          if (line === "" || line.startsWith("&")) continue;
          chartBody += line;
        }
        metadata.availableDifficulties[4] = true;
        selectedDifficulty = 4;
      } else {
        throw new Error(
          `Difficulty ${difficulty} not found in chart. Available: ${availableDiffs2.join(", ")}`
        );
      }
      const designerKey = `des_${selectedDifficulty}`;
      const selectedDesigner = metadata.designers[designerKey] || metadata.designer;
      if (Number.isNaN(metadata.bpm)) {
        const inlineBpm = chartBody.match(/\((\d+(?:\.\d+)?)\)/);
        if (inlineBpm) metadata.bpm = parseFloat(inlineBpm[1]);
      }
      if (Number.isNaN(metadata.bpm)) {
        metadata.bpm = 120;
      }
      const parseResult = parseNotes(chartBody, metadata.bpm);
      const notes = parseResult.notes;
      const bpmEvents = parseResult.bpmEvents;
      const divisorEvents = parseResult.divisorEvents;
      metadata.bpm = parseResult.firstBpm;
      if (Number.isNaN(metadata.bpm)) {
        throw new Error("Simai \u6587\u4EF6\u7F3A\u5C11 BPM \u58F0\u660E\uFF08\u65E0 &bpm \u5143\u6570\u636E\uFF0C\u8C31\u9762\u4E2D\u4E5F\u6CA1\u6709\u5185\u8054 BPM\uFF09");
      }
      let maxMeasure = 0;
      let maxTiming = 0;
      for (const note of notes) {
        if (note.measure > maxMeasure) {
          maxMeasure = note.measure;
        }
        let endTiming = note.timing;
        if ("isHoldStart" in note && note.isHoldStart && "duration" in note) {
          endTiming = note.timing + note.duration;
        }
        if (note.type === "slide") {
          const slideNote = note;
          const delays = slideNote.allDelayMs ?? [slideNote.delayMs ?? 0];
          const durations = slideNote.allDurationMs ?? [slideNote.durationMs ?? 0];
          let maxEndMs = 0;
          for (let i2 = 0; i2 < Math.max(delays.length, durations.length); i2++) {
            maxEndMs = Math.max(maxEndMs, (delays[i2] ?? 0) + (durations[i2] ?? 0));
          }
          endTiming = note.timing + maxEndMs * slideNote.bpm / 6e4;
        }
        if (note.type === "touch-hold-start") {
          const touchHold = note;
          if (touchHold.duration !== void 0) {
            endTiming = note.timing + touchHold.duration;
          }
        }
        if (endTiming > maxTiming) {
          maxTiming = endTiming;
        }
      }
      const measuresFromTiming = Math.ceil(maxTiming / 4);
      maxMeasure = Math.max(maxMeasure, measuresFromTiming);
      const leadInMs = 6e4 * 4 / parseResult.firstBpm;
      for (const note of notes) {
        note.measure += 1;
        note.timing += 4;
        note.timingMs += leadInMs;
        if ("holdStartTiming" in note && note.holdStartTiming !== void 0) {
          note.holdStartTiming += 4;
        }
      }
      for (const event of bpmEvents) {
        event.timing += 4;
      }
      bpmEvents.unshift({ timing: 0, bpm: parseResult.firstBpm });
      for (const event of divisorEvents) {
        event.timing += 4;
      }
      divisorEvents.unshift({ timing: 0, divisor: 4 });
      divisorEvents.sort((a2, b2) => a2.timing - b2.timing);
      return {
        bpm: parseResult.firstBpm,
        title: metadata.title,
        artist: metadata.artist,
        designer: selectedDesigner,
        level: metadata.level,
        designers: metadata.designers,
        difficulty: selectedDifficulty,
        availableDifficulties: metadata.availableDifficulties,
        measures: maxMeasure + 2,
        // 前后各留 1 小节缓冲
        notes,
        bpmEvents,
        divisorEvents,
        firstMs: metadata.firstSec !== void 0 ? metadata.firstSec * 1e3 : void 0
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Parse error: ${message}`);
    }
  }
  function parseMetadataLine(line, metadata) {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) return;
    const key = line.substring(1, eqIndex).trim();
    const value = line.substring(eqIndex + 1).trim();
    switch (key) {
      case "title":
        metadata.title = value;
        break;
      case "artist":
        metadata.artist = value;
        break;
      case "des":
        metadata.designer = value;
        break;
      case "des_1":
      case "des_2":
      case "des_3":
      case "des_4":
      case "des_5":
      case "des_6":
      case "des_7":
        metadata.designers[key] = value;
        break;
      case "lv_1":
      case "lv_2":
      case "lv_3":
      case "lv_4":
      case "lv_5":
      case "lv_6":
      case "lv_7":
        metadata.level[key] = value;
        break;
      case "bpm": {
        const bpmVal = parseFloat(value);
        if (!isNaN(bpmVal)) {
          metadata.bpm = bpmVal;
        }
        break;
      }
      case "first": {
        const firstVal = parseFloat(value);
        if (!isNaN(firstVal)) {
          metadata.firstSec = firstVal;
        }
        break;
      }
    }
  }
  function parseNotes(chartBody, initialBpm) {
    const notes = [];
    const bpmEvents = [];
    const divisorEvents = [];
    let currentBpm = initialBpm;
    let firstBpm = null;
    let divisor = 4;
    let currentBeat = 0;
    let currentMs = 0;
    let currentHiSpeed = 1;
    let pos = 0;
    const skipWhitespace = () => {
      while (pos < chartBody.length && isWhitespace(chartBody[pos])) {
        pos++;
      }
    };
    while (pos < chartBody.length) {
      skipWhitespace();
      if (pos >= chartBody.length) break;
      let noteContent = "";
      const startPos = pos;
      while (pos < chartBody.length && chartBody[pos] !== ",") {
        const char = chartBody[pos];
        if (isWhitespace(char)) {
          pos++;
          continue;
        }
        if (char === "(") {
          const bpmMatch = chartBody.slice(pos).match(/^\((\d+(?:\.\d+)?)\)/);
          if (bpmMatch) {
            currentBpm = parseFloat(bpmMatch[1]);
            if (firstBpm === null) firstBpm = currentBpm;
            bpmEvents.push({ timing: currentBeat, bpm: currentBpm });
            pos += bpmMatch[0].length;
            continue;
          }
        }
        if (char === "{") {
          const divisorMatch = chartBody.slice(pos).match(/^\{(\d+(?:\.\d+)?)\}/);
          if (divisorMatch) {
            const newDivisor = parseFloat(divisorMatch[1]);
            if (newDivisor !== divisor) {
              divisor = newDivisor;
              divisorEvents.push({ timing: currentBeat, divisor });
            }
            pos += divisorMatch[0].length;
            continue;
          }
        }
        if (char === "<") {
          const hsMatch = chartBody.slice(pos).match(/^<HS\*([-+]?\d*\.?\d+)>/i);
          if (hsMatch) {
            currentHiSpeed = parseFloat(hsMatch[1]);
            pos += hsMatch[0].length;
            continue;
          }
        }
        noteContent += char;
        pos++;
      }
      if (pos === startPos && pos < chartBody.length && chartBody[pos] !== ",") {
        pos++;
        continue;
      }
      const beatIncrement = 4 / divisor;
      if (noteContent.trim() !== "") {
        const measure = Math.floor(currentBeat / 4);
        const positionInMeasure = Math.floor(currentBeat % 4 / 4 * 512);
        const noteGroups = [];
        let currentGroup = "";
        for (let i2 = 0; i2 < noteContent.length; i2++) {
          if (noteContent[i2] === "`") {
            if (currentGroup.trim() !== "") {
              noteGroups.push(currentGroup.trim());
            }
            currentGroup = "`";
          } else if (noteContent[i2] === "/") {
            if (currentGroup.trim() !== "") {
              noteGroups.push(currentGroup.trim());
            }
            currentGroup = "";
          } else {
            currentGroup += noteContent[i2];
          }
        }
        if (currentGroup.trim() !== "") {
          noteGroups.push(currentGroup.trim());
        }
        const isSimultaneous = noteGroups.length > 1;
        for (const group of noteGroups) {
          let noteStr = group.trim();
          if (noteStr === "") continue;
          let hasDelayMarker = false;
          if (noteStr.startsWith("`")) {
            hasDelayMarker = true;
            noteStr = noteStr.substring(1);
          }
          const parsedNotes = parseNoteString(
            noteStr,
            currentBeat,
            currentMs,
            measure,
            positionInMeasure,
            currentBpm,
            isSimultaneous,
            hasDelayMarker
          );
          if (currentHiSpeed !== 1) {
            for (const note of parsedNotes) note.hiSpeed = currentHiSpeed;
          }
          notes.push(...parsedNotes);
        }
      }
      currentBeat += beatIncrement;
      currentMs += 6e4 * beatIncrement / currentBpm;
      if (pos < chartBody.length && chartBody[pos] === ",") {
        pos++;
      }
    }
    return {
      notes,
      firstBpm: firstBpm !== null ? firstBpm : initialBpm,
      bpmEvents: bpmEvents.length > 0 ? bpmEvents : [{ timing: 0, bpm: initialBpm }],
      divisorEvents
    };
  }
  function parseHoldDuration(divisor, beats, seconds, bpm) {
    if (divisor) {
      return 4 / parseFloat(divisor) * parseFloat(beats);
    }
    return parseFloat(seconds) * bpm / 60;
  }
  function parseNoteString(noteStr, timing, timingMs, measure, positionInMeasure, bpm, isSimultaneous, hasDelayMarker) {
    const notes = [];
    const delayOffset = hasDelayMarker ? 1 : 0;
    const holdMatch = noteStr.match(/^(\d+)[hbx]{1,3}\[(?:([\d.]+):([\d.]+)|#([\d.]+))\][bx]*$/i);
    if (holdMatch) {
      const position = parseInt(holdMatch[1]);
      const holdDuration = parseHoldDuration(holdMatch[2], holdMatch[3], holdMatch[4], bpm);
      const lowerNoteStr = noteStr.toLowerCase();
      const isBreakHold = lowerNoteStr.includes("b");
      const isEx = lowerNoteStr.includes("x");
      if (position >= 1 && position <= 8) {
        const durationMs = 6e4 * holdDuration / bpm;
        const holdStart = {
          position,
          timing,
          timingMs: timingMs + delayOffset,
          type: isSimultaneous ? "hold-start-simultaneous" : "hold-start",
          measure,
          positionInMeasure,
          scale: 1,
          bpm,
          duration: holdDuration,
          isHoldStart: true,
          isEx,
          isBreakHold,
          hasDelayMarker
        };
        notes.push(holdStart);
        const endTiming = timing + holdDuration;
        const endTimingMs = timingMs + durationMs + delayOffset;
        const endMeasure = Math.floor(endTiming / 4);
        const endPositionInMeasure = Math.floor(endTiming % 4 / 4 * 512);
        const holdEnd = {
          position,
          timing: endTiming,
          timingMs: endTimingMs,
          type: isSimultaneous ? "hold-end-simultaneous" : "hold-end",
          measure: endMeasure,
          positionInMeasure: endPositionInMeasure,
          scale: 1,
          bpm,
          holdStartTiming: timing,
          isHoldEnd: true,
          isEx,
          isBreakHold
        };
        notes.push(holdEnd);
        return notes;
      }
    }
    const slideMatch = noteStr.match(/^(\d+)([bx?!@]*[-><^vpqszVw*]+.*)$/i);
    if (slideMatch && /[-><^vpqszVw]/i.test(slideMatch[2])) {
      const startPosition = parseInt(slideMatch[1]);
      const slideNotation = slideMatch[2];
      const pathStartIndex = slideNotation.search(/[-><^vpqszVw*]/i);
      const startModifiers = pathStartIndex >= 0 ? slideNotation.slice(0, pathStartIndex).toLowerCase() : "";
      const headlessMarker = M(startModifiers).when(
        (s2) => s2.includes("!"),
        () => "!"
      ).when(
        (s2) => s2.includes("?"),
        () => "?"
      ).otherwise(() => null);
      const isStartBreak = startModifiers.includes("b");
      const isHeadless = headlessMarker !== null;
      const hasTapHead = !isHeadless && startModifiers.includes("@");
      const isEx = noteStr.toLowerCase().includes("x");
      const slideParts = slideNotation.split("*");
      const allSlideSegments = [];
      const allDurations = [];
      const allDurationMs = [];
      const allDelayMs = [];
      const allCustomLengths = [];
      const allSlideBreaks = [];
      for (const part of slideParts) {
        const hasBreak = /[-><^vpqszVw]\d*b/i.test(part) || /\]b/i.test(part);
        allSlideBreaks.push(hasBreak);
        const hasMultipleTimings = (part.match(/\[[\d.:#+]+\]/g) || []).length > 1;
        if (hasMultipleTimings) {
          const parseResult = parseSlideSegmentsWithTiming(startPosition, part, bpm);
          allSlideSegments.push(parseResult.segments);
          allDurations.push(parseResult.totalDuration);
          allDurationMs.push(parseResult.totalDurationMs);
          allDelayMs.push(6e4 / bpm);
          allCustomLengths.push(null);
        } else {
          let duration = 1;
          let customDelay = null;
          let customDurationSeconds = null;
          let customLengthSeconds = null;
          const secondsMatch = part.match(/\[([\d.]+)##([\d.]+)\]/);
          const secondsOnlyMatch = part.match(/\[#([\d.]+)\]/);
          if (secondsMatch) {
            customDelay = parseFloat(secondsMatch[1]);
            customLengthSeconds = parseFloat(secondsMatch[2]);
            duration = customLengthSeconds;
          } else if (secondsOnlyMatch) {
            customLengthSeconds = parseFloat(secondsOnlyMatch[1]);
            duration = customLengthSeconds;
          } else {
            const timingMatch = part.match(/\[(?:([\d.]+)#)?([\d.]+):([\d.]+)(?:##([\d.]+))?\]/);
            if (timingMatch) {
              if (timingMatch[1]) {
                customDelay = parseFloat(timingMatch[1]);
              }
              duration = 4 / parseFloat(timingMatch[2]) * parseFloat(timingMatch[3]);
              if (timingMatch[4]) {
                customDurationSeconds = parseFloat(timingMatch[4]);
              }
            }
          }
          let durationMsValue;
          let delayMsValue;
          if (customLengthSeconds !== null) {
            durationMsValue = customLengthSeconds * 1e3;
            delayMsValue = customDelay !== null ? customDelay * 1e3 : 6e4 / bpm;
          } else {
            durationMsValue = customDurationSeconds !== null ? customDurationSeconds * 1e3 : 6e4 * duration / bpm;
            delayMsValue = customDelay !== null ? 6e4 / customDelay : 6e4 / bpm;
          }
          allDurations.push(duration);
          allDurationMs.push(durationMsValue);
          allDelayMs.push(delayMsValue);
          allCustomLengths.push(customDurationSeconds);
          const pathOnly = part.replace(/\[(?:(?:[\d.]+#)?[\d.]+:[\d.]+(?:##[\d.]+)?|[\d.]+##[\d.]+)\]/gi, "").replace(/[bx]/gi, "");
          const segments = parseSlideSegments(startPosition, pathOnly);
          allSlideSegments.push(segments);
        }
      }
      if (startPosition >= 1 && startPosition <= 8) {
        const slideNote = {
          position: startPosition,
          timing,
          timingMs: timingMs + delayOffset,
          type: "slide",
          measure,
          positionInMeasure,
          scale: 1,
          bpm,
          isHeadless,
          headlessMode: M(headlessMarker).with("!", () => "pop").with("?", () => "fade").with(null, () => void 0).exhaustive(),
          hasTapHead,
          isStartBreak,
          allSlideBreaks,
          isEx,
          duration: allDurations[0],
          durationMs: allDurationMs[0],
          delayMs: allDelayMs[0],
          slideSegments: allSlideSegments[0],
          allSlideSegments,
          allDurations,
          allDurationMs,
          allDelayMs,
          allCustomLengths,
          isSplitSlide: allSlideSegments.length > 1,
          customLength: allCustomLengths[0],
          hasDelayMarker
        };
        notes.push(slideNote);
        return notes;
      }
    }
    if (isMultiDigitNote(noteStr)) {
      const digits = noteStr.split("");
      let allValid = true;
      for (const digit of digits) {
        const pos = parseInt(digit);
        if (pos < 1 || pos > 8) {
          allValid = false;
          break;
        }
      }
      if (allValid) {
        for (const digit of digits) {
          const position = parseInt(digit);
          const tapNote = {
            position,
            timing,
            timingMs: timingMs + delayOffset,
            type: "simultaneous",
            measure,
            positionInMeasure,
            scale: 1,
            bpm,
            hasDelayMarker
          };
          notes.push(tapNote);
        }
        return notes;
      }
    }
    const touchMatch = noteStr.match(
      /^([ABCDE])(\d*)([hbfx]*)(?:\[(?:([\d.]+):([\d.]+)|#([\d.]+))\])?$/i
    );
    if (touchMatch) {
      const region = touchMatch[1].toUpperCase();
      const sensorNum = touchMatch[2] ? parseInt(touchMatch[2]) : null;
      const modifiers = touchMatch[3] ? touchMatch[3].toLowerCase() : "";
      let isValidTouch = false;
      if (region === "C") {
        isValidTouch = !sensorNum || sensorNum === 1 || sensorNum === 2;
      } else if (["A", "B", "D", "E"].includes(region)) {
        isValidTouch = sensorNum !== null && sensorNum >= 1 && sensorNum <= 8;
      }
      if (isValidTouch) {
        const touchPosition = sensorNum ? `${region}${sensorNum}` : region;
        const isHold = modifiers.includes("h");
        const hasFirework = modifiers.includes("f");
        if (isHold && (touchMatch[4] || touchMatch[6])) {
          const holdDuration = parseHoldDuration(touchMatch[4], touchMatch[5], touchMatch[6], bpm);
          const durationMs = 6e4 * holdDuration / bpm;
          const touchHoldStart = {
            position: touchPosition,
            timing,
            timingMs: timingMs + delayOffset,
            type: "touch-hold-start",
            measure,
            positionInMeasure,
            scale: 1,
            bpm,
            duration: holdDuration,
            durationMs,
            hasFirework,
            isHoldStart: true,
            hasDelayMarker
          };
          notes.push(touchHoldStart);
          const endTiming = timing + holdDuration;
          const endTimingMs = timingMs + durationMs + delayOffset;
          const endMeasure = Math.floor(endTiming / 4);
          const endPositionInMeasure = Math.floor(endTiming % 4 / 4 * 512);
          const touchHoldEnd = {
            position: touchPosition,
            timing: endTiming,
            timingMs: endTimingMs,
            type: "touch-hold-end",
            measure: endMeasure,
            positionInMeasure: endPositionInMeasure,
            scale: 1,
            bpm,
            holdStartTiming: timing,
            hasFirework,
            isHoldEnd: true
          };
          notes.push(touchHoldEnd);
        } else {
          const touchNote = {
            position: touchPosition,
            timing,
            timingMs: timingMs + delayOffset,
            type: "touch",
            measure,
            positionInMeasure,
            scale: 1,
            bpm,
            hasFirework,
            hasDelayMarker
          };
          notes.push(touchNote);
        }
        return notes;
      }
    }
    const tapMatch = noteStr.match(/^(\d+)([bx$]*)$/i);
    if (tapMatch) {
      const position = parseInt(tapMatch[1]);
      const modifiers = tapMatch[2].toLowerCase();
      const starCount = modifiers.split("$").length - 1;
      const isBreak = modifiers.includes("b");
      const isEx = modifiers.includes("x");
      const isStar = starCount > 0;
      const isSpinningStar = starCount >= 2;
      if (position >= 1 && position <= 8) {
        const tapNote = {
          position,
          timing,
          timingMs: timingMs + delayOffset,
          type: isBreak ? "break" : isSimultaneous ? "simultaneous" : "tap",
          measure,
          positionInMeasure,
          scale: 1,
          bpm,
          isStar,
          isSpinningStar,
          isEx,
          hasDelayMarker
        };
        notes.push(tapNote);
      }
    }
    return notes;
  }
  function parseSlideSegmentsWithTiming(startPosition, pathNotation, defaultBpm) {
    const segments = [];
    const segmentDurations = [];
    const segmentDurationMs = [];
    let currentPos = startPosition;
    let i2 = 0;
    while (i2 < pathNotation.length) {
      const char = pathNotation[i2];
      let pathType = null;
      if (i2 + 1 < pathNotation.length && pathNotation[i2 + 1] === char && "pq".includes(char)) {
        pathType = char + char;
        i2 += 2;
      } else if ("-><^vpqszVw".includes(char)) {
        pathType = char;
        i2++;
      } else {
        i2++;
        continue;
      }
      if (pathType === "V") {
        let numStr = "";
        while (i2 < pathNotation.length && /\d/.test(pathNotation[i2])) {
          numStr += pathNotation[i2];
          i2++;
        }
        if (i2 < pathNotation.length && pathNotation[i2] === "[") {
          const bracketEnd = pathNotation.indexOf("]", i2);
          if (bracketEnd !== -1) {
            i2 = bracketEnd + 1;
          }
        }
        if (numStr.length >= 2) {
          const midPos = parseInt(numStr[0]);
          const endPos = parseInt(numStr.substring(1));
          const start = currentPos;
          const leftCorner = (start + 5) % 8 + 1;
          const rightCorner = (start + 1) % 8 + 1;
          const d2 = ((endPos - start) % 8 + 8) % 8;
          const isStdV = midPos === leftCorner && d2 >= 1 && d2 <= 4 || midPos === rightCorner && (8 - d2) % 8 >= 1 && (8 - d2) % 8 <= 4;
          if (isStdV) {
            segments.push({
              type: "V",
              startPos: start,
              endPos,
              midPos
            });
            segmentDurations.push(1);
            segmentDurationMs.push(6e4 / defaultBpm);
          } else {
            segments.push({ type: "-", startPos: start, endPos: midPos });
            segments.push({ type: "-", startPos: midPos, endPos });
            segmentDurations.push(0.5, 0.5);
            segmentDurationMs.push(6e4 * 0.5 / defaultBpm, 6e4 * 0.5 / defaultBpm);
          }
          currentPos = endPos;
        }
      } else {
        let numStr = "";
        while (i2 < pathNotation.length && /\d/.test(pathNotation[i2])) {
          numStr += pathNotation[i2];
          i2++;
        }
        while (i2 < pathNotation.length && /[bx]/i.test(pathNotation[i2])) {
          i2++;
        }
        let segDuration = 1;
        let segDurationMs = 6e4 / defaultBpm;
        if (i2 < pathNotation.length && pathNotation[i2] === "[") {
          const bracketEnd = pathNotation.indexOf("]", i2);
          if (bracketEnd !== -1) {
            const timingStr = pathNotation.substring(i2 + 1, bracketEnd);
            const secondsMatch = timingStr.match(/^([\d.]+)##([\d.]+)$/);
            const secondsOnlyMatch = timingStr.match(/^#([\d.]+)$/);
            if (secondsMatch) {
              segDuration = parseFloat(secondsMatch[2]);
              segDurationMs = segDuration * 1e3;
            } else if (secondsOnlyMatch) {
              segDurationMs = parseFloat(secondsOnlyMatch[1]) * 1e3;
              segDuration = segDurationMs * defaultBpm / 6e4;
            } else {
              const stdMatch = timingStr.match(/^(?:([\d.]+)#)?([\d.]+):([\d.]+)(?:##([\d.]+))?$/);
              if (stdMatch) {
                segDuration = 4 / parseFloat(stdMatch[2]) * parseFloat(stdMatch[3]);
                if (stdMatch[4]) {
                  segDurationMs = parseFloat(stdMatch[4]) * 1e3;
                } else {
                  segDurationMs = 6e4 * segDuration / defaultBpm;
                }
              }
            }
            i2 = bracketEnd + 1;
            while (i2 < pathNotation.length && /[bx]/i.test(pathNotation[i2])) {
              i2++;
            }
          }
        }
        if (numStr) {
          const endPos = parseInt(numStr);
          segments.push({
            type: pathType,
            startPos: currentPos,
            endPos
          });
          segmentDurations.push(segDuration);
          segmentDurationMs.push(segDurationMs);
          currentPos = endPos;
        }
      }
    }
    const totalDuration = segmentDurations.reduce((a2, b2) => a2 + b2, 0);
    const totalDurationMs = segmentDurationMs.reduce((a2, b2) => a2 + b2, 0);
    return {
      segments,
      segmentDurations,
      segmentDurationMs,
      totalDuration,
      totalDurationMs
    };
  }
  function parseSlideSegments(startPosition, pathNotation) {
    return parseSlideSegmentsWithTiming(startPosition, pathNotation, 120).segments;
  }

  // ../adx-dl/packages/maimai-chart-engine/src/core/audio/AudioManager.ts
  var SOUND_LEAD_MS = -ANSWER_SOUND_BASE_OFFSET_MS;

  // render.ts
  function beatsToMs(beats, bpmEvents, defaultBpm) {
    if (!bpmEvents || bpmEvents.length === 0) return 6e4 * beats / defaultBpm;
    let totalMs = 0;
    let lastBeat = 0;
    let currentBpm = defaultBpm;
    for (const ev of bpmEvents) {
      if (ev.timing >= beats) break;
      totalMs += 6e4 * (ev.timing - lastBeat) / currentBpm;
      lastBeat = ev.timing;
      currentBpm = ev.bpm;
    }
    return totalMs + 6e4 * (beats - lastBeat) / currentBpm;
  }
  function msToBeats(ms, bpmEvents, defaultBpm) {
    if (!bpmEvents || bpmEvents.length === 0) return ms * defaultBpm / 6e4;
    let remaining = ms;
    let totalBeats = 0;
    let lastBeat = 0;
    let currentBpm = defaultBpm;
    for (const ev of bpmEvents) {
      const segmentMs = 6e4 * (ev.timing - lastBeat) / currentBpm;
      if (remaining <= segmentMs) return totalBeats + remaining * currentBpm / 6e4;
      remaining -= segmentMs;
      totalBeats += ev.timing - lastBeat;
      lastBeat = ev.timing;
      currentBpm = ev.bpm;
    }
    return totalBeats + remaining * currentBpm / 6e4;
  }
  var qs = new URLSearchParams(typeof window !== "undefined" ? window.location.search || "" : "");
  function pickStr(key, fallback) {
    const v2 = qs.get(key);
    return v2 === null || v2 === "" ? fallback : v2;
  }
  function pickNum(key, fallback) {
    const raw = qs.get(key);
    if (raw === null || raw.trim() === "") return fallback;
    const n2 = Number(raw);
    return Number.isFinite(n2) ? n2 : fallback;
  }
  function pickBool(key, fallback) {
    const raw = qs.get(key);
    if (raw === null || raw === "") return fallback;
    const s2 = raw.trim().toLowerCase();
    return s2 === "1" || s2 === "true" || s2 === "on" || s2 === "yes";
  }
  var chartId = pickStr("id", "11879").trim();
  var wantDiffRaw = qs.get("diff");
  var initT = Math.max(0, pickNum("t", 0));
  var initSpeed = pickNum("speed", 1);
  var initHiSpeed = pickNum("hiSpeed", 6);
  var initMirror = pickBool("mirror", false);
  var initAutoplay = pickBool("autoplay", false);
  var initHud = pickBool("hud", false);
  // 本地扩展：允许外部（离线编码器）指定逻辑边长与像素比，默认与上游一致。
  var initSize = Math.max(200, pickNum("size", 900));
  var initDpr = Math.max(0.5, pickNum("dpr", window.devicePixelRatio || 1));
  function byId(id) {
    return document.getElementById(id);
  }
  var canvas = byId("canvas");
  var errBox = byId("err");
  var hudBox = byId("hud");
  var playBtn = byId("play");
  var restartBtn = byId("restart");
  var timeEl = byId("time");
  var seekEl = byId("seek");
  var loopEl = byId("loop");
  var hiSpeedEl = byId("hiSpeed");
  var hiSpeedV = byId("hiSpeedV");
  var speedEl = byId("playbackSpeed");
  var speedV = byId("playbackSpeedV");
  var mirrorEl = byId("mirror");
  var exHiEl = byId("exHi");
  var metaEl = byId("meta");
  var BEATS_PER_MEASURE = 4;
  var renderer = null;
  var chart = null;
  var loadedChartId = "";
  var loadedDiff = 0;
  var availableDiffs = [];
  var currentBeats = 0;
  var anchorBeats = 0;
  var anchorTime = 0;
  var isPlaying = false;
  var playbackSpeed = initSpeed;
  var hiSpeedValue = initHiSpeed;
  var mirrorOn = initMirror;
  var exOn = false;
  var hudVisible = initHud;
  var lastError = null;
  var readyPromise = null;
  var pendingOptions = /* @__PURE__ */ new Map();
  var now = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
  function totalBeatsOf(c2) {
    return c2.measures * BEATS_PER_MEASURE;
  }
  function totalMsOf(c2) {
    return beatsToMs(totalBeatsOf(c2), c2.bpmEvents, c2.bpm);
  }
  function notReadyReason() {
    if (lastError) return `\u6E32\u67D3\u672A\u5C31\u7EEA\uFF08\u521D\u59CB\u5316\u5931\u8D25\uFF09: ${lastError}`;
    return "\u6E32\u67D3\u672A\u5C31\u7EEA\uFF08\u8BF7\u5148 await window.__chartPreview.ready\uFF09";
  }
  function ensureReady() {
    if (!chart || !renderer) throw new Error(notReadyReason());
    return { chart, renderer };
  }
  function fmt(ms) {
    if (!Number.isFinite(ms) || ms < 0) ms = 0;
    const s2 = Math.floor(ms / 1e3);
    return `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`;
  }
  function renderHud() {
    if (hudBox) hudBox.style.display = hudVisible ? "flex" : "none";
  }
  function syncControlUi() {
    if (hiSpeedEl) hiSpeedEl.value = String(hiSpeedValue);
    if (hiSpeedV) hiSpeedV.textContent = hiSpeedValue.toFixed(2);
    if (speedEl) speedEl.value = String(playbackSpeed);
    if (speedV) speedV.textContent = `${playbackSpeed.toFixed(2)}x`;
    if (mirrorEl) mirrorEl.checked = mirrorOn;
    if (exHiEl) exHiEl.checked = exOn;
  }
  function syncSeekUi() {
    if (!chart) return;
    const tb = totalBeatsOf(chart);
    if (seekEl) seekEl.value = String(Math.round(tb > 0 ? currentBeats / tb * 1e3 : 0));
    if (timeEl) timeEl.textContent = `${fmt(beatsToMs(currentBeats, chart.bpmEvents, chart.bpm))} / ${fmt(totalMsOf(chart))}`;
  }
  function syncMetaUi() {
    if (!metaEl || !chart) return;
    metaEl.textContent = `id ${loadedChartId} \xB7 \u96BE\u5EA6 ${loadedDiff} \xB7 BPM ${chart.bpm} \xB7 ${fmt(totalMsOf(chart))}`;
  }
  function showError(msg) {
    if (errBox) {
      errBox.style.display = "block";
      errBox.textContent = "\u6E32\u67D3\u5931\u8D25: " + msg;
    }
    console.error("[render]", msg);
  }
  function renderMsSync(ms) {
    const { chart: c2, renderer: r2 } = ensureReady();
    const total = totalMsOf(c2);
    const raw = Number(ms);
    const target = Math.max(0, Math.min(Number.isFinite(raw) ? raw : 0, total));
    currentBeats = msToBeats(target, c2.bpmEvents, c2.bpm);
    anchorBeats = currentBeats;
    anchorTime = now();
    r2.renderFrame(c2, currentBeats, BEATS_PER_MEASURE);
  }
  function repaintIfPaused() {
    if (isPlaying) return;
    if (!chart || !renderer) return;
    renderer.renderFrame(chart, currentBeats, BEATS_PER_MEASURE);
  }
  function setPlaying(next) {
    if (next && !isPlaying && chart) {
      if (currentBeats >= totalBeatsOf(chart) - 0.01) {
        currentBeats = 0;
      }
      anchorBeats = currentBeats;
      anchorTime = now();
    }
    isPlaying = next;
    if (renderer) renderer.setIsPlaying(isPlaying);
    if (playBtn) playBtn.textContent = isPlaying ? "\u23F8 \u6682\u505C" : "\u25B6 \u64AD\u653E";
  }
  function normalizeOption(k2) {
    const s2 = String(k2).trim().toLowerCase();
    switch (s2) {
      case "hud":
        return "hud";
      case "mirror":
        return "mirror";
      case "hispeed":
        return "hiSpeed";
      case "speed":
        return "speed";
      case "ex":
      case "exhi":
      case "highlightex":
        return "ex";
      default:
        throw new Error(`\u4E0D\u652F\u6301\u7684\u9009\u9879: ${String(k2)}\uFF08\u652F\u6301 hud / mirror / hiSpeed / speed / ex\uFF09`);
    }
  }
  function toBool(v2) {
    if (typeof v2 === "boolean") return v2;
    if (typeof v2 === "number") return v2 !== 0;
    if (typeof v2 === "string") {
      const s2 = v2.trim().toLowerCase();
      return s2 === "1" || s2 === "true" || s2 === "on" || s2 === "yes";
    }
    return !!v2;
  }
  function toNum(v2, name) {
    const n2 = typeof v2 === "number" ? v2 : Number(String(v2));
    if (!Number.isFinite(n2)) {
      throw new Error(`\u9009\u9879 ${name} \u9700\u8981\u6709\u9650\u6570\u503C\uFF0C\u6536\u5230 ${JSON.stringify(v2) ?? String(v2)}`);
    }
    return n2;
  }
  function applyOption(key, v2) {
    switch (key) {
      case "hud":
        hudVisible = toBool(v2);
        renderHud();
        return;
      case "mirror": {
        const { renderer: r2 } = ensureReady();
        mirrorOn = toBool(v2);
        r2.setMirrorMode(mirrorOn ? "horizontal" : "none");
        syncControlUi();
        repaintIfPaused();
        return;
      }
      case "hiSpeed": {
        const { renderer: r2 } = ensureReady();
        hiSpeedValue = toNum(v2, "hiSpeed");
        r2.setHiSpeed(hiSpeedValue);
        syncControlUi();
        repaintIfPaused();
        return;
      }
      case "speed": {
        const { renderer: r2 } = ensureReady();
        playbackSpeed = toNum(v2, "speed");
        r2.setPlaybackSpeed(playbackSpeed);
        anchorBeats = currentBeats;
        anchorTime = now();
        syncControlUi();
        repaintIfPaused();
        return;
      }
      case "ex": {
        const { renderer: r2 } = ensureReady();
        exOn = toBool(v2);
        r2.setHighlightExNotes(exOn);
        syncControlUi();
        repaintIfPaused();
        return;
      }
    }
  }
  var api = {
    get ready() {
      return readyPromise ?? void 0;
    },
    get error() {
      return lastError;
    },
    renderMs(ms) {
      renderMsSync(ms);
    },
    seekMs(ms) {
      renderMsSync(ms);
      syncSeekUi();
    },
    setOption(k2, v2) {
      const key = normalizeOption(k2);
      if (key === "hud") {
        applyOption(key, v2);
        return;
      }
      if (!chart || !renderer) {
        pendingOptions.set(key, v2);
        return;
      }
      applyOption(key, v2);
    },
    captureDataUrl() {
      if (!canvas) throw new Error("\u9875\u9762\u7F3A\u5C11 #canvas \u5143\u7D20");
      return canvas.toDataURL("image/png");
    },
    /** 本地扩展：离线编码器可直接指定像素尺寸并立即重绘当前帧。 */
    setSize(size, dpr2 = 1) {
      if (!renderer || !chart) throw new Error("\u6E32\u67D3\u5668\u5C1A\u672A\u5C31\u7EEA");
      const s2 = Math.max(200, Math.round(Number(size) || 900));
      const d2 = Math.max(0.5, Number(dpr2) || 1);
      renderer.resizeToSize(s2, d2);
      renderer.renderFrame(chart, currentBeats, BEATS_PER_MEASURE);
      return { width: canvas.width, height: canvas.height };
    },
    getSize() {
      if (!canvas) return null;
      return { width: canvas.width, height: canvas.height };
    },
    /** 本地扩展：返回已加载谱面的元信息（含难度列表与总时长）。 */
    info() {
      if (!chart) return null;
      return {
        chartId: loadedChartId,
        diff: loadedDiff,
        difficulties: availableDiffs,
        bpm: chart.bpm,
        totalBeats: totalBeatsOf(chart),
        totalMs: totalMsOf(chart)
      };
    }
  };
  window.__chartPreview = api;
  function frame() {
    if (isPlaying && chart && renderer) {
      const c2 = chart;
      const elapsed = now() - anchorTime;
      let ms = beatsToMs(anchorBeats, c2.bpmEvents, c2.bpm) + elapsed * playbackSpeed;
      const total = totalMsOf(c2);
      const loop = loopEl ? loopEl.checked : false;
      if (loop && total > 0) ms = ms % total;
      if (!loop && ms >= total) {
        currentBeats = totalBeatsOf(c2);
        anchorBeats = currentBeats;
        anchorTime = now();
        renderer.renderFrame(c2, currentBeats, BEATS_PER_MEASURE);
        setPlaying(false);
      } else {
        currentBeats = msToBeats(ms, c2.bpmEvents, c2.bpm);
        anchorBeats = currentBeats;
        anchorTime = now();
        renderer.renderFrame(c2, currentBeats, BEATS_PER_MEASURE);
      }
      syncSeekUi();
    }
    requestAnimationFrame(frame);
  }
  function wireControls() {
    if (playBtn) playBtn.onclick = () => setPlaying(!isPlaying);
    if (restartBtn) restartBtn.onclick = () => {
      renderMsSync(0);
      syncSeekUi();
    };
    if (canvas) canvas.onclick = () => setPlaying(!isPlaying);
    if (seekEl) {
      seekEl.oninput = () => {
        if (!chart) return;
        renderMsSync(msFromFrac(Number(seekEl.value) / 1e3));
        syncSeekUi();
      };
    }
    if (hiSpeedEl) {
      hiSpeedEl.oninput = () => {
        const n2 = Number(hiSpeedEl.value);
        if (!Number.isFinite(n2)) return;
        applyOption("hiSpeed", n2);
      };
    }
    if (speedEl) {
      speedEl.oninput = () => {
        const n2 = Number(speedEl.value);
        if (!Number.isFinite(n2)) return;
        applyOption("speed", n2);
      };
    }
    if (mirrorEl) mirrorEl.onchange = () => applyOption("mirror", mirrorEl.checked);
    if (exHiEl) exHiEl.onchange = () => applyOption("ex", exHiEl.checked);
    window.addEventListener("keydown", (e2) => {
      const tag = e2.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!chart) return;
      switch (e2.key) {
        case " ":
          e2.preventDefault();
          setPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e2.preventDefault();
          renderMsSync(beatsToMs(currentBeats - (e2.shiftKey ? 4 : 1 / 8), chart.bpmEvents, chart.bpm));
          syncSeekUi();
          break;
        case "ArrowRight":
          e2.preventDefault();
          renderMsSync(beatsToMs(currentBeats + (e2.shiftKey ? 4 : 1 / 8), chart.bpmEvents, chart.bpm));
          syncSeekUi();
          break;
        case "r":
        case "R":
          renderMsSync(0);
          syncSeekUi();
          break;
      }
    });
    window.addEventListener("resize", () => {
      if (!chart || !renderer) return;
      renderer.resizeToSize(initSize, initDpr);
      renderer.renderFrame(chart, currentBeats, BEATS_PER_MEASURE);
    });
  }
  function msFromFrac(frac) {
    if (!chart) return 0;
    const tb = totalBeatsOf(chart);
    const beats = Math.max(0, Math.min(frac, 1)) * tb;
    return beatsToMs(beats, chart.bpmEvents, chart.bpm);
  }
  async function boot() {
    if (!canvas) throw new Error("\u9875\u9762\u7F3A\u5C11 #canvas \u5143\u7D20");
    if (!/^[0-9]+$/.test(chartId)) {
      throw new Error(`\u975E\u6CD5\u8C31\u9762 id: ${JSON.stringify(chartId)}\uFF08\u53EA\u63A5\u53D7 [0-9]+\uFF09`);
    }
    const resp = await fetch(`./charts/${chartId}.txt`, { cache: "no-store" });
    if (!resp.ok) throw new Error(`\u8C31\u9762 ${chartId} \u4E0D\u5B58\u5728\uFF08HTTP ${resp.status}\uFF09`);
    const text = await resp.text();
    if (!text || text.trim().length === 0) throw new Error(`\u8C31\u9762 ${chartId} \u5185\u5BB9\u4E3A\u7A7A`);
    const difficulties = Object.keys(getAvailableDifficulties(text)).map(Number).sort((a2, b2) => a2 - b2);
    if (difficulties.length === 0) {
      throw new Error(`\u8C31\u9762 ${chartId} \u672A\u627E\u5230\u4EFB\u4F55\u96BE\u5EA6\u6BB5\uFF08&inote_N=\uFF09`);
    }
    let diff;
    if (wantDiffRaw === null || wantDiffRaw.trim() === "") {
      diff = Math.max(...difficulties);
    } else {
      diff = Number(wantDiffRaw);
      if (!Number.isInteger(diff) || !difficulties.includes(diff)) {
        throw new Error(`\u8C31\u9762 ${chartId} \u4E0D\u5B58\u5728\u96BE\u5EA6 ${wantDiffRaw}\uFF08\u53EF\u7528: ${difficulties.join(", ")}\uFF09`);
      }
    }
    const parsed = parseSimaiChart(text, diff);
    chart = parsed;
    loadedChartId = chartId;
    loadedDiff = diff;
    availableDiffs = difficulties;
    renderer = new MainRenderer(canvas);
    renderer.resizeToSize(initSize, initDpr);
    renderer.setHiSpeed(initHiSpeed);
    renderer.setPlaybackSpeed(initSpeed);
    renderer.setMirrorMode(initMirror ? "horizontal" : "none");
    renderer.setHighlightExNotes(exOn);
    renderer.setIsPlaying(false);
    playbackSpeed = initSpeed;
    hiSpeedValue = initHiSpeed;
    mirrorOn = initMirror;
    wireControls();
    for (const [k2, v2] of pendingOptions) applyOption(k2, v2);
    pendingOptions.clear();
    renderHud();
    syncControlUi();
    renderMsSync(initT);
    syncSeekUi();
    syncMetaUi();
    setPlaying(initAutoplay);
    requestAnimationFrame(frame);
    return {
      chartId: loadedChartId,
      diff: loadedDiff,
      difficulties: availableDiffs,
      bpm: parsed.bpm,
      totalBeats: totalBeatsOf(parsed),
      totalMs: totalMsOf(parsed)
    };
  }
  readyPromise = boot();
  void readyPromise.then(
    () => {
      lastError = null;
    },
    (err) => {
      const msg = err instanceof Error ? err.stack || err.message : String(err);
      lastError = msg;
      readyPromise = null;
      showError(msg);
    }
  );
})();
