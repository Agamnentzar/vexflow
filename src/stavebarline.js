// Vex Flow Notation
// Author Larry Kuhns 2011
// Implements barlines (single, double, repeat, end)
//
// Requires vex.js.

/**
 * @constructor
 */
Vex.Flow.Barline = function(type, x) {
  if (arguments.length > 0) this.init(type, x);
}

Vex.Flow.Barline.type = {
  SINGLE: 1,
  DOUBLE: 2,
  END: 3,
  REPEAT_BEGIN: 4,
  REPEAT_END: 5,
  NONE: 6
};

Vex.Flow.Barline.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.Barline.prototype.constructor = Vex.Flow.Barline;
Vex.Flow.Barline.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.Barline.prototype.init = function(type, x) {
  var superclass = Vex.Flow.Barline.superclass;
  superclass.init.call(this);

  this.barline = type;
  this.x = x;    // Left most x for the stave
}

Vex.Flow.Barline.prototype.getCategory = function() {return "barlines";}
Vex.Flow.Barline.prototype.setX = function(x) {this.x = x; return this;}

  // Draw barlines
Vex.Flow.Barline.prototype.draw = function(stave, x) {
  // Get last stave
  var connected = stave.connectedStaves;
  var lastStave = connected.length > 0 ?
                  connected[connected.length - 1] : stave;
  // x :: the right shift if the stave has clef, time sig, etc.
  switch (this.barline) {
    case Vex.Flow.Barline.type.SINGLE:
      this.drawVerticalBar(stave, lastStave, this.x, false);
      break;
    case Vex.Flow.Barline.type.DOUBLE:
      this.drawVerticalBar(stave, lastStave, this.x, true);
      break;
    case Vex.Flow.Barline.type.END:
      this.drawVerticalEndBar(stave, lastStave, this.x);
      break;
    case Vex.Flow.Barline.type.REPEAT_BEGIN:
      // If repeat begin is not at start of stave, draw single barline
      if (x > 0)
        this.drawVerticalBar(stave, lastStave, this.x, false);
      this.drawRepeatBar(stave, lastStave, this.x + x, true);
      break;
    case Vex.Flow.Barline.type.REPEAT_END:
      this.drawRepeatBar(stave, lastStave, this.x, false);
      break;
    default:
      // Default is NONE, so nothing to draw
      break;
  }
}

Vex.Flow.Barline.prototype.drawVerticalBar = function(
  stave, lastStave, x, double_bar) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");
  var top_line = stave.getYForLine(0);
  var bottom_line = lastStave.getYForLine(lastStave.options.num_lines - 1);
  if (double_bar)
    stave.context.fillRect(x - 3, top_line, 1, bottom_line - top_line + 1);
  stave.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
}

Vex.Flow.Barline.prototype.drawVerticalEndBar = function(
  stave, lastStave, x) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var top_line = stave.getYForLine(0);
  var bottom_line = lastStave.getYForLine(lastStave.options.num_lines - 1);
  stave.context.fillRect(x - 5, top_line, 1, bottom_line - top_line + 1);
  stave.context.fillRect(x - 2, top_line, 3, bottom_line - top_line + 1);
}

Vex.Flow.Barline.prototype.drawRepeatBar = function(
  stave, lastStave, x, begin) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var ctx = stave.context;
  var top_line = stave.getYForLine(0);
  var bottom_line = lastStave.getYForLine(lastStave.options.num_lines - 1);
  var x_shift = 3;
  var dot_radius = 2;

  if (!begin) {
    x_shift = -5;
  }

  ctx.fillRect(x + x_shift, top_line, 1, bottom_line - top_line + 1);
  ctx.fillRect(x - 2, top_line, 3, bottom_line - top_line + 1);

  // Shift dots left or right
  x_shift += begin ? 4 : -4;

  var dot_x = (x + x_shift) + (dot_radius / 2);

  function drawDots(staff) {
    var line_spacing = staff.options.spacing_between_lines_px;
    var top_line = staff.getYForLine(0);
    // calculate the y offset based on number of stave lines
    var y_offset = (staff.options.num_lines - 1) * line_spacing;
    y_offset = (y_offset / 2) - (line_spacing / 2);
    var dot_y = top_line + y_offset + (dot_radius / 2);

    // draw the top repeat dot
    ctx.beginPath();
    ctx.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
    //draw the bottom repeat dot
    ctx.arc(dot_x, dot_y + line_spacing, dot_radius, 0, Math.PI * 2, false);
    ctx.fill();
  }

  drawDots(stave);

  for (var i = 0; i < stave.connectedStaves.length; i++) {
    drawDots(stave.connectedStaves[i]);
  }
}
