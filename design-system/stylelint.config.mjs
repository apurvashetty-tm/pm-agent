// Token linter (D-100). Rules that can't have exceptions live in a tool, not a prompt.
// Every listed property must use a --tm-* token, an allowed keyword, or calc()/min()/max()/clamp()
// built only from tokens and unitless numbers. Run it through design-system/scripts/check_tokens.py,
// which also honours same-line `/* raw-ok: <reason> */` markers and the block exemptions.

const NAMED_COLOURS = 'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'.split(' ');

// A --tm-* token, optionally with a --tm-* token as its fallback.
const VAR = 'var\\(--tm-[\\w-]+(?:,\\s*var\\(--tm-[\\w-]+\\))?\\)';
// A trailing comma is a list separator (transition / box-shadow lists), not part of the value (D-99).
const TOKEN = `/^${VAR},?$/`;
const BASE_KEYWORDS = ['0', 'auto', 'none', 'inherit', 'initial', 'unset', 'revert', 'currentColor', 'currentcolor', 'transparent', '100%'];
// calc()/min()/max()/clamp() built only from --tm-* tokens, unitless numbers, 100%, env() safe areas and operators.
const TOKEN_MATH = `/^(?:calc|min|max|clamp)\\((?:\\s|,|${VAR}|env\\([\\w-]+\\)|100%|-?\\d*\\.?\\d+(?![\\w%.])|[-+*/()]|calc\\()*\\)$/`;
// Layout / style keywords (solid, inset, flex, fit-content, ease-in, opacity, …) but never a named colour.
const KEYWORD = `/^(?!(?:${NAMED_COLOURS.join('|')})$)-?[a-zA-Z][\\w-]*,?$/i`;
const URL = '/^url\\(/';

const COLOUR_ONLY = [TOKEN, ...BASE_KEYWORDS];
const GENERAL = [TOKEN, TOKEN_MATH, KEYWORD, URL, ...BASE_KEYWORDS];

export default {
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      [
        '/^(?!--).*color$/', 'fill', 'stroke', 'background', 'box-shadow',
        '/^border(-.*)?$/', '/^outline(-.*)?$/', 'stroke-width',
        '/^(min-|max-)?(width|height|inline-size|block-size)$/',
        '/^(margin|padding)(-.*)?$/', '/^(row-|column-)?gap$/',
        '/^inset(-.*)?$/', 'top', 'right', 'bottom', 'left',
        'font-size', 'line-height', 'letter-spacing', 'z-index', 'opacity',
        '/^transition(-duration|-delay)?$/', '/^animation(-duration|-delay)?$/',
      ],
      {
        ignoreVariables: false,
        ignoreFunctions: false,
        ignoreValues: {
          '': GENERAL,
          '/^(?!--).*color$/': COLOUR_ONLY,
          fill: COLOUR_ONLY,
          stroke: COLOUR_ONLY,
        },
        message: 'Raw value "${value}" in "${property}": use a --tm-* token, or add /* raw-ok: <reason> */ on the line.',
      },
    ],
  },
};
