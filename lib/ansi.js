
/**
 * Module dependencies.
 */

var prefix = '\033['
  , suffix = 'm'
  , debug = require('debug')('ansi')

/**
 * Generic ANSI codes.
 */

var styles = {
    bold: 1
  , italic: 3
  , underline: 4
  , inverse: 7
};

/**
 * The negating ANSI code for the generic modes.
 */

var clear = {
    bold: 22
  , italic: 23
  , underline: 24
  , inverse: 27
  , foreground: 39
  , background: 48
};

/**
 * The standard, styleable ANSI colors.
 */

var colors = {
    white: 37
  , grey: 90
  , black: 30
  , blue: 34
  , cyan: 36
  , green: 32
  , magenta: 35
  , red: 31
  , yellow: 33
};


/**
 * Creates a Cursor instance based off the given `writable stream` instance.
 */

function create (stream, options) {
  var cursor = new Cursor(stream, options);
  return cursor;
}
module.exports = exports = create;


function Cursor (stream, options) {
  this.stream = stream;
  this.fg = this.foreground = new Foreground(this);
  this.bg = this.background = new Background(this);
}
exports.Cursor = Cursor;

function Foreground (cursor) {
  this.cursor = cursor;
}

function Background (cursor) {
  this.cursor = cursor;
}

/**
 * Set up the functions for the generic ANSI codes.
 */

Object.keys(styles).forEach(function (style) {
  var name = style[0].toUpperCase() + style.substring(1);

  debug('defining `Cursor#'+style+'`');
  Cursor.prototype[style] = function () {
    this.stream.write(prefix + styles[style] + suffix);
  }

  debug('defining `Cursor#clear'+name+'`');
  Cursor.prototype['clear'+name] = function () {
    this.stream.write(prefix + clear[style] + suffix);
  }
});

/**
 * Setup the functions for the standard colors.
 */

Object.keys(colors).forEach(function (color) {
  debug('defining `Foreground#'+color+'`');
  Foreground.prototype[color] = function () {
    this.cursor.stream.write(prefix + colors[color] + suffix);
  }

  debug('defining `Background#'+color+'`');
  var bgCode = colors[color] + 10;
  Background.prototype[color] = function () {
    this.cursor.stream.write(prefix + bgCode + suffix);
  }

  debug('defining `Cursor#`'+color+'`');
  Cursor.prototype[color] = function () {
    this.foreground[color]();
  }
});

Foreground.prototype.clear = function () {
  this.cursor.stream.write(prefix + clear.foreground + suffix);
}

Background.prototype.clear = function () {
  this.cursor.stream.write(prefix + clear.background + suffix);
}

/**
 * Clears all ANSI formatting on the stream.
 */

Cursor.prototype.clear = function () {
  this.stream.write(prefix + '0' + suffix);
}

Foreground.prototype.rgb = function (r, g, b) {
  this.cursor.stream.write(prefix + '38;5;' + rgb(r, g, b) + suffix);
}

Background.prototype.rgb = function (r, g, b) {
  this.cursor.stream.write(prefix + '48;5;' + rgb(r, g, b) + suffix);
}


function rgb (r, g, b) {
  var red = r / 255 * 5
    , green = g / 255 * 5
    , blue = b / 255 * 5
  return rgb5(red, green, blue);
}

function rgb5 (r, g, b) {
  var red = Math.round(r)
    , green = Math.round(g)
    , blue = Math.round(b)
  return 16 + (red*36) + (green*6) + blue;
}