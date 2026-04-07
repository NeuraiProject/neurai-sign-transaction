var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/bitcoinjs-lib/src/networks.js
var require_networks = __commonJS({
  "node_modules/bitcoinjs-lib/src/networks.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.testnet = exports2.regtest = exports2.bitcoin = void 0;
    exports2.bitcoin = {
      /**
       * The message prefix used for signing Bitcoin messages.
       */
      messagePrefix: "Bitcoin Signed Message:\n",
      /**
       * The Bech32 prefix used for Bitcoin addresses.
       */
      bech32: "bc",
      /**
       * The BIP32 key prefixes for Bitcoin.
       */
      bip32: {
        /**
         * The public key prefix for BIP32 extended public keys.
         */
        public: 76067358,
        /**
         * The private key prefix for BIP32 extended private keys.
         */
        private: 76066276
      },
      /**
       * The prefix for Bitcoin public key hashes.
       */
      pubKeyHash: 0,
      /**
       * The prefix for Bitcoin script hashes.
       */
      scriptHash: 5,
      /**
       * The prefix for Bitcoin Wallet Import Format (WIF) private keys.
       */
      wif: 128
    };
    exports2.regtest = {
      messagePrefix: "Bitcoin Signed Message:\n",
      bech32: "bcrt",
      bip32: {
        public: 70617039,
        private: 70615956
      },
      pubKeyHash: 111,
      scriptHash: 196,
      wif: 239
    };
    exports2.testnet = {
      messagePrefix: "Bitcoin Signed Message:\n",
      bech32: "tb",
      bip32: {
        public: 70617039,
        private: 70615956
      },
      pubKeyHash: 111,
      scriptHash: 196,
      wif: 239
    };
  }
});

// node_modules/bitcoinjs-lib/src/bip66.js
var require_bip66 = __commonJS({
  "node_modules/bitcoinjs-lib/src/bip66.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = exports2.decode = exports2.check = void 0;
    function check(buffer) {
      if (buffer.length < 8) return false;
      if (buffer.length > 72) return false;
      if (buffer[0] !== 48) return false;
      if (buffer[1] !== buffer.length - 2) return false;
      if (buffer[2] !== 2) return false;
      const lenR = buffer[3];
      if (lenR === 0) return false;
      if (5 + lenR >= buffer.length) return false;
      if (buffer[4 + lenR] !== 2) return false;
      const lenS = buffer[5 + lenR];
      if (lenS === 0) return false;
      if (6 + lenR + lenS !== buffer.length) return false;
      if (buffer[4] & 128) return false;
      if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128)) return false;
      if (buffer[lenR + 6] & 128) return false;
      if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
        return false;
      return true;
    }
    exports2.check = check;
    function decode2(buffer) {
      if (buffer.length < 8) throw new Error("DER sequence length is too short");
      if (buffer.length > 72) throw new Error("DER sequence length is too long");
      if (buffer[0] !== 48) throw new Error("Expected DER sequence");
      if (buffer[1] !== buffer.length - 2)
        throw new Error("DER sequence length is invalid");
      if (buffer[2] !== 2) throw new Error("Expected DER integer");
      const lenR = buffer[3];
      if (lenR === 0) throw new Error("R length is zero");
      if (5 + lenR >= buffer.length) throw new Error("R length is too long");
      if (buffer[4 + lenR] !== 2) throw new Error("Expected DER integer (2)");
      const lenS = buffer[5 + lenR];
      if (lenS === 0) throw new Error("S length is zero");
      if (6 + lenR + lenS !== buffer.length) throw new Error("S length is invalid");
      if (buffer[4] & 128) throw new Error("R value is negative");
      if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128))
        throw new Error("R value excessively padded");
      if (buffer[lenR + 6] & 128) throw new Error("S value is negative");
      if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
        throw new Error("S value excessively padded");
      return {
        r: buffer.slice(4, 4 + lenR),
        s: buffer.slice(6 + lenR)
      };
    }
    exports2.decode = decode2;
    function encode2(r, s) {
      const lenR = r.length;
      const lenS = s.length;
      if (lenR === 0) throw new Error("R length is zero");
      if (lenS === 0) throw new Error("S length is zero");
      if (lenR > 33) throw new Error("R length is too long");
      if (lenS > 33) throw new Error("S length is too long");
      if (r[0] & 128) throw new Error("R value is negative");
      if (s[0] & 128) throw new Error("S value is negative");
      if (lenR > 1 && r[0] === 0 && !(r[1] & 128))
        throw new Error("R value excessively padded");
      if (lenS > 1 && s[0] === 0 && !(s[1] & 128))
        throw new Error("S value excessively padded");
      const signature = Buffer.allocUnsafe(6 + lenR + lenS);
      signature[0] = 48;
      signature[1] = signature.length - 2;
      signature[2] = 2;
      signature[3] = r.length;
      r.copy(signature, 4);
      signature[4 + lenR] = 2;
      signature[5 + lenR] = s.length;
      s.copy(signature, 6 + lenR);
      return signature;
    }
    exports2.encode = encode2;
  }
});

// node_modules/bitcoinjs-lib/src/ops.js
var require_ops = __commonJS({
  "node_modules/bitcoinjs-lib/src/ops.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.REVERSE_OPS = exports2.OPS = void 0;
    var OPS = {
      OP_FALSE: 0,
      OP_0: 0,
      OP_PUSHDATA1: 76,
      OP_PUSHDATA2: 77,
      OP_PUSHDATA4: 78,
      OP_1NEGATE: 79,
      OP_RESERVED: 80,
      OP_TRUE: 81,
      OP_1: 81,
      OP_2: 82,
      OP_3: 83,
      OP_4: 84,
      OP_5: 85,
      OP_6: 86,
      OP_7: 87,
      OP_8: 88,
      OP_9: 89,
      OP_10: 90,
      OP_11: 91,
      OP_12: 92,
      OP_13: 93,
      OP_14: 94,
      OP_15: 95,
      OP_16: 96,
      OP_NOP: 97,
      OP_VER: 98,
      OP_IF: 99,
      OP_NOTIF: 100,
      OP_VERIF: 101,
      OP_VERNOTIF: 102,
      OP_ELSE: 103,
      OP_ENDIF: 104,
      OP_VERIFY: 105,
      OP_RETURN: 106,
      OP_TOALTSTACK: 107,
      OP_FROMALTSTACK: 108,
      OP_2DROP: 109,
      OP_2DUP: 110,
      OP_3DUP: 111,
      OP_2OVER: 112,
      OP_2ROT: 113,
      OP_2SWAP: 114,
      OP_IFDUP: 115,
      OP_DEPTH: 116,
      OP_DROP: 117,
      OP_DUP: 118,
      OP_NIP: 119,
      OP_OVER: 120,
      OP_PICK: 121,
      OP_ROLL: 122,
      OP_ROT: 123,
      OP_SWAP: 124,
      OP_TUCK: 125,
      OP_CAT: 126,
      OP_SUBSTR: 127,
      OP_LEFT: 128,
      OP_RIGHT: 129,
      OP_SIZE: 130,
      OP_INVERT: 131,
      OP_AND: 132,
      OP_OR: 133,
      OP_XOR: 134,
      OP_EQUAL: 135,
      OP_EQUALVERIFY: 136,
      OP_RESERVED1: 137,
      OP_RESERVED2: 138,
      OP_1ADD: 139,
      OP_1SUB: 140,
      OP_2MUL: 141,
      OP_2DIV: 142,
      OP_NEGATE: 143,
      OP_ABS: 144,
      OP_NOT: 145,
      OP_0NOTEQUAL: 146,
      OP_ADD: 147,
      OP_SUB: 148,
      OP_MUL: 149,
      OP_DIV: 150,
      OP_MOD: 151,
      OP_LSHIFT: 152,
      OP_RSHIFT: 153,
      OP_BOOLAND: 154,
      OP_BOOLOR: 155,
      OP_NUMEQUAL: 156,
      OP_NUMEQUALVERIFY: 157,
      OP_NUMNOTEQUAL: 158,
      OP_LESSTHAN: 159,
      OP_GREATERTHAN: 160,
      OP_LESSTHANOREQUAL: 161,
      OP_GREATERTHANOREQUAL: 162,
      OP_MIN: 163,
      OP_MAX: 164,
      OP_WITHIN: 165,
      OP_RIPEMD160: 166,
      OP_SHA1: 167,
      OP_SHA256: 168,
      OP_HASH160: 169,
      OP_HASH256: 170,
      OP_CODESEPARATOR: 171,
      OP_CHECKSIG: 172,
      OP_CHECKSIGVERIFY: 173,
      OP_CHECKMULTISIG: 174,
      OP_CHECKMULTISIGVERIFY: 175,
      OP_NOP1: 176,
      OP_NOP2: 177,
      OP_CHECKLOCKTIMEVERIFY: 177,
      OP_NOP3: 178,
      OP_CHECKSEQUENCEVERIFY: 178,
      OP_NOP4: 179,
      OP_NOP5: 180,
      OP_NOP6: 181,
      OP_NOP7: 182,
      OP_NOP8: 183,
      OP_NOP9: 184,
      OP_NOP10: 185,
      OP_CHECKSIGADD: 186,
      OP_PUBKEYHASH: 253,
      OP_PUBKEY: 254,
      OP_INVALIDOPCODE: 255
    };
    exports2.OPS = OPS;
    var REVERSE_OPS = {};
    exports2.REVERSE_OPS = REVERSE_OPS;
    for (const op of Object.keys(OPS)) {
      const code = OPS[op];
      REVERSE_OPS[code] = op;
    }
  }
});

// node_modules/bitcoinjs-lib/src/push_data.js
var require_push_data = __commonJS({
  "node_modules/bitcoinjs-lib/src/push_data.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decode = exports2.encode = exports2.encodingLength = void 0;
    var ops_1 = require_ops();
    function encodingLength(i) {
      return i < ops_1.OPS.OP_PUSHDATA1 ? 1 : i <= 255 ? 2 : i <= 65535 ? 3 : 5;
    }
    exports2.encodingLength = encodingLength;
    function encode2(buffer, num, offset) {
      const size = encodingLength(num);
      if (size === 1) {
        buffer.writeUInt8(num, offset);
      } else if (size === 2) {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA1, offset);
        buffer.writeUInt8(num, offset + 1);
      } else if (size === 3) {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA2, offset);
        buffer.writeUInt16LE(num, offset + 1);
      } else {
        buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA4, offset);
        buffer.writeUInt32LE(num, offset + 1);
      }
      return size;
    }
    exports2.encode = encode2;
    function decode2(buffer, offset) {
      const opcode = buffer.readUInt8(offset);
      let num;
      let size;
      if (opcode < ops_1.OPS.OP_PUSHDATA1) {
        num = opcode;
        size = 1;
      } else if (opcode === ops_1.OPS.OP_PUSHDATA1) {
        if (offset + 2 > buffer.length) return null;
        num = buffer.readUInt8(offset + 1);
        size = 2;
      } else if (opcode === ops_1.OPS.OP_PUSHDATA2) {
        if (offset + 3 > buffer.length) return null;
        num = buffer.readUInt16LE(offset + 1);
        size = 3;
      } else {
        if (offset + 5 > buffer.length) return null;
        if (opcode !== ops_1.OPS.OP_PUSHDATA4) throw new Error("Unexpected opcode");
        num = buffer.readUInt32LE(offset + 1);
        size = 5;
      }
      return {
        opcode,
        number: num,
        size
      };
    }
    exports2.decode = decode2;
  }
});

// node_modules/bitcoinjs-lib/src/script_number.js
var require_script_number = __commonJS({
  "node_modules/bitcoinjs-lib/src/script_number.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = exports2.decode = void 0;
    function decode2(buffer, maxLength, minimal) {
      maxLength = maxLength || 4;
      minimal = minimal === void 0 ? true : minimal;
      const length2 = buffer.length;
      if (length2 === 0) return 0;
      if (length2 > maxLength) throw new TypeError("Script number overflow");
      if (minimal) {
        if ((buffer[length2 - 1] & 127) === 0) {
          if (length2 <= 1 || (buffer[length2 - 2] & 128) === 0)
            throw new Error("Non-minimally encoded script number");
        }
      }
      if (length2 === 5) {
        const a = buffer.readUInt32LE(0);
        const b = buffer.readUInt8(4);
        if (b & 128) return -((b & ~128) * 4294967296 + a);
        return b * 4294967296 + a;
      }
      let result = 0;
      for (let i = 0; i < length2; ++i) {
        result |= buffer[i] << 8 * i;
      }
      if (buffer[length2 - 1] & 128)
        return -(result & ~(128 << 8 * (length2 - 1)));
      return result;
    }
    exports2.decode = decode2;
    function scriptNumSize(i) {
      return i > 2147483647 ? 5 : i > 8388607 ? 4 : i > 32767 ? 3 : i > 127 ? 2 : i > 0 ? 1 : 0;
    }
    function encode2(_number) {
      let value = Math.abs(_number);
      const size = scriptNumSize(value);
      const buffer = Buffer.allocUnsafe(size);
      const negative = _number < 0;
      for (let i = 0; i < size; ++i) {
        buffer.writeUInt8(value & 255, i);
        value >>= 8;
      }
      if (buffer[size - 1] & 128) {
        buffer.writeUInt8(negative ? 128 : 0, size - 1);
      } else if (negative) {
        buffer[size - 1] |= 128;
      }
      return buffer;
    }
    exports2.encode = encode2;
  }
});

// node_modules/typeforce/native.js
var require_native = __commonJS({
  "node_modules/typeforce/native.js"(exports2, module2) {
    var types = {
      Array: function(value) {
        return value !== null && value !== void 0 && value.constructor === Array;
      },
      Boolean: function(value) {
        return typeof value === "boolean";
      },
      Function: function(value) {
        return typeof value === "function";
      },
      Nil: function(value) {
        return value === void 0 || value === null;
      },
      Number: function(value) {
        return typeof value === "number";
      },
      Object: function(value) {
        return typeof value === "object";
      },
      String: function(value) {
        return typeof value === "string";
      },
      "": function() {
        return true;
      }
    };
    types.Null = types.Nil;
    for (typeName in types) {
      types[typeName].toJSON = function(t) {
        return t;
      }.bind(null, typeName);
    }
    var typeName;
    module2.exports = types;
  }
});

// node_modules/typeforce/errors.js
var require_errors = __commonJS({
  "node_modules/typeforce/errors.js"(exports2, module2) {
    var native = require_native();
    function getTypeName(fn) {
      return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
    }
    function getValueTypeName(value) {
      return native.Nil(value) ? "" : getTypeName(value.constructor);
    }
    function getValue(value) {
      if (native.Function(value)) return "";
      if (native.String(value)) return JSON.stringify(value);
      if (value && native.Object(value)) return "";
      return value;
    }
    function captureStackTrace(e, t) {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(e, t);
      }
    }
    function tfJSON(type) {
      if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type);
      if (native.Array(type)) return "Array";
      if (type && native.Object(type)) return "Object";
      return type !== void 0 ? type : "";
    }
    function tfErrorString(type, value, valueTypeName) {
      var valueJson = getValue(value);
      return "Expected " + tfJSON(type) + ", got" + (valueTypeName !== "" ? " " + valueTypeName : "") + (valueJson !== "" ? " " + valueJson : "");
    }
    function TfTypeError(type, value, valueTypeName) {
      valueTypeName = valueTypeName || getValueTypeName(value);
      this.message = tfErrorString(type, value, valueTypeName);
      captureStackTrace(this, TfTypeError);
      this.__type = type;
      this.__value = value;
      this.__valueTypeName = valueTypeName;
    }
    TfTypeError.prototype = Object.create(Error.prototype);
    TfTypeError.prototype.constructor = TfTypeError;
    function tfPropertyErrorString(type, label, name, value, valueTypeName) {
      var description = '" of type ';
      if (label === "key") description = '" with key type ';
      return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName);
    }
    function TfPropertyTypeError(type, property, label, value, valueTypeName) {
      if (type) {
        valueTypeName = valueTypeName || getValueTypeName(value);
        this.message = tfPropertyErrorString(type, label, property, value, valueTypeName);
      } else {
        this.message = 'Unexpected property "' + property + '"';
      }
      captureStackTrace(this, TfTypeError);
      this.__label = label;
      this.__property = property;
      this.__type = type;
      this.__value = value;
      this.__valueTypeName = valueTypeName;
    }
    TfPropertyTypeError.prototype = Object.create(Error.prototype);
    TfPropertyTypeError.prototype.constructor = TfTypeError;
    function tfCustomError(expected, actual) {
      return new TfTypeError(expected, {}, actual);
    }
    function tfSubError(e, property, label) {
      if (e instanceof TfPropertyTypeError) {
        property = property + "." + e.__property;
        e = new TfPropertyTypeError(
          e.__type,
          property,
          e.__label,
          e.__value,
          e.__valueTypeName
        );
      } else if (e instanceof TfTypeError) {
        e = new TfPropertyTypeError(
          e.__type,
          property,
          label,
          e.__value,
          e.__valueTypeName
        );
      }
      captureStackTrace(e);
      return e;
    }
    module2.exports = {
      TfTypeError,
      TfPropertyTypeError,
      tfCustomError,
      tfSubError,
      tfJSON,
      getValueTypeName
    };
  }
});

// node_modules/typeforce/extra.js
var require_extra = __commonJS({
  "node_modules/typeforce/extra.js"(exports2, module2) {
    var NATIVE = require_native();
    var ERRORS = require_errors();
    function _Buffer(value) {
      return Buffer.isBuffer(value);
    }
    function Hex(value) {
      return typeof value === "string" && /^([0-9a-f]{2})+$/i.test(value);
    }
    function _LengthN(type, length2) {
      var name = type.toJSON();
      function Length(value) {
        if (!type(value)) return false;
        if (value.length === length2) return true;
        throw ERRORS.tfCustomError(name + "(Length: " + length2 + ")", name + "(Length: " + value.length + ")");
      }
      Length.toJSON = function() {
        return name;
      };
      return Length;
    }
    var _ArrayN = _LengthN.bind(null, NATIVE.Array);
    var _BufferN = _LengthN.bind(null, _Buffer);
    var _HexN = _LengthN.bind(null, Hex);
    var _StringN = _LengthN.bind(null, NATIVE.String);
    function Range(a, b, f) {
      f = f || NATIVE.Number;
      function _range(value, strict) {
        return f(value, strict) && value > a && value < b;
      }
      _range.toJSON = function() {
        return `${f.toJSON()} between [${a}, ${b}]`;
      };
      return _range;
    }
    var INT53_MAX = Math.pow(2, 53) - 1;
    function Finite(value) {
      return typeof value === "number" && isFinite(value);
    }
    function Int8(value) {
      return value << 24 >> 24 === value;
    }
    function Int16(value) {
      return value << 16 >> 16 === value;
    }
    function Int32(value) {
      return (value | 0) === value;
    }
    function Int53(value) {
      return typeof value === "number" && value >= -INT53_MAX && value <= INT53_MAX && Math.floor(value) === value;
    }
    function UInt8(value) {
      return (value & 255) === value;
    }
    function UInt16(value) {
      return (value & 65535) === value;
    }
    function UInt32(value) {
      return value >>> 0 === value;
    }
    function UInt53(value) {
      return typeof value === "number" && value >= 0 && value <= INT53_MAX && Math.floor(value) === value;
    }
    var types = {
      ArrayN: _ArrayN,
      Buffer: _Buffer,
      BufferN: _BufferN,
      Finite,
      Hex,
      HexN: _HexN,
      Int8,
      Int16,
      Int32,
      Int53,
      Range,
      StringN: _StringN,
      UInt8,
      UInt16,
      UInt32,
      UInt53
    };
    for (typeName in types) {
      types[typeName].toJSON = function(t) {
        return t;
      }.bind(null, typeName);
    }
    var typeName;
    module2.exports = types;
  }
});

// node_modules/typeforce/index.js
var require_typeforce = __commonJS({
  "node_modules/typeforce/index.js"(exports2, module2) {
    var ERRORS = require_errors();
    var NATIVE = require_native();
    var tfJSON = ERRORS.tfJSON;
    var TfTypeError = ERRORS.TfTypeError;
    var TfPropertyTypeError = ERRORS.TfPropertyTypeError;
    var tfSubError = ERRORS.tfSubError;
    var getValueTypeName = ERRORS.getValueTypeName;
    var TYPES = {
      arrayOf: function arrayOf(type, options) {
        type = compile(type);
        options = options || {};
        function _arrayOf(array, strict) {
          if (!NATIVE.Array(array)) return false;
          if (NATIVE.Nil(array)) return false;
          if (options.minLength !== void 0 && array.length < options.minLength) return false;
          if (options.maxLength !== void 0 && array.length > options.maxLength) return false;
          if (options.length !== void 0 && array.length !== options.length) return false;
          return array.every(function(value, i) {
            try {
              return typeforce(type, value, strict);
            } catch (e) {
              throw tfSubError(e, i);
            }
          });
        }
        _arrayOf.toJSON = function() {
          var str = "[" + tfJSON(type) + "]";
          if (options.length !== void 0) {
            str += "{" + options.length + "}";
          } else if (options.minLength !== void 0 || options.maxLength !== void 0) {
            str += "{" + (options.minLength === void 0 ? 0 : options.minLength) + "," + (options.maxLength === void 0 ? Infinity : options.maxLength) + "}";
          }
          return str;
        };
        return _arrayOf;
      },
      maybe: function maybe(type) {
        type = compile(type);
        function _maybe(value, strict) {
          return NATIVE.Nil(value) || type(value, strict, maybe);
        }
        _maybe.toJSON = function() {
          return "?" + tfJSON(type);
        };
        return _maybe;
      },
      map: function map(propertyType, propertyKeyType) {
        propertyType = compile(propertyType);
        if (propertyKeyType) propertyKeyType = compile(propertyKeyType);
        function _map(value, strict) {
          if (!NATIVE.Object(value)) return false;
          if (NATIVE.Nil(value)) return false;
          for (var propertyName in value) {
            try {
              if (propertyKeyType) {
                typeforce(propertyKeyType, propertyName, strict);
              }
            } catch (e) {
              throw tfSubError(e, propertyName, "key");
            }
            try {
              var propertyValue = value[propertyName];
              typeforce(propertyType, propertyValue, strict);
            } catch (e) {
              throw tfSubError(e, propertyName);
            }
          }
          return true;
        }
        if (propertyKeyType) {
          _map.toJSON = function() {
            return "{" + tfJSON(propertyKeyType) + ": " + tfJSON(propertyType) + "}";
          };
        } else {
          _map.toJSON = function() {
            return "{" + tfJSON(propertyType) + "}";
          };
        }
        return _map;
      },
      object: function object2(uncompiled) {
        var type = {};
        for (var typePropertyName in uncompiled) {
          type[typePropertyName] = compile(uncompiled[typePropertyName]);
        }
        function _object(value, strict) {
          if (!NATIVE.Object(value)) return false;
          if (NATIVE.Nil(value)) return false;
          var propertyName;
          try {
            for (propertyName in type) {
              var propertyType = type[propertyName];
              var propertyValue = value[propertyName];
              typeforce(propertyType, propertyValue, strict);
            }
          } catch (e) {
            throw tfSubError(e, propertyName);
          }
          if (strict) {
            for (propertyName in value) {
              if (type[propertyName]) continue;
              throw new TfPropertyTypeError(void 0, propertyName);
            }
          }
          return true;
        }
        _object.toJSON = function() {
          return tfJSON(type);
        };
        return _object;
      },
      anyOf: function anyOf() {
        var types = [].slice.call(arguments).map(compile);
        function _anyOf(value, strict) {
          return types.some(function(type) {
            try {
              return typeforce(type, value, strict);
            } catch (e) {
              return false;
            }
          });
        }
        _anyOf.toJSON = function() {
          return types.map(tfJSON).join("|");
        };
        return _anyOf;
      },
      allOf: function allOf() {
        var types = [].slice.call(arguments).map(compile);
        function _allOf(value, strict) {
          return types.every(function(type) {
            try {
              return typeforce(type, value, strict);
            } catch (e) {
              return false;
            }
          });
        }
        _allOf.toJSON = function() {
          return types.map(tfJSON).join(" & ");
        };
        return _allOf;
      },
      quacksLike: function quacksLike(type) {
        function _quacksLike(value) {
          return type === getValueTypeName(value);
        }
        _quacksLike.toJSON = function() {
          return type;
        };
        return _quacksLike;
      },
      tuple: function tuple() {
        var types = [].slice.call(arguments).map(compile);
        function _tuple(values, strict) {
          if (NATIVE.Nil(values)) return false;
          if (NATIVE.Nil(values.length)) return false;
          if (strict && values.length !== types.length) return false;
          return types.every(function(type, i) {
            try {
              return typeforce(type, values[i], strict);
            } catch (e) {
              throw tfSubError(e, i);
            }
          });
        }
        _tuple.toJSON = function() {
          return "(" + types.map(tfJSON).join(", ") + ")";
        };
        return _tuple;
      },
      value: function value(expected) {
        function _value(actual) {
          return actual === expected;
        }
        _value.toJSON = function() {
          return expected;
        };
        return _value;
      }
    };
    TYPES.oneOf = TYPES.anyOf;
    function compile(type) {
      if (NATIVE.String(type)) {
        if (type[0] === "?") return TYPES.maybe(type.slice(1));
        return NATIVE[type] || TYPES.quacksLike(type);
      } else if (type && NATIVE.Object(type)) {
        if (NATIVE.Array(type)) {
          if (type.length !== 1) throw new TypeError("Expected compile() parameter of type Array of length 1");
          return TYPES.arrayOf(type[0]);
        }
        return TYPES.object(type);
      } else if (NATIVE.Function(type)) {
        return type;
      }
      return TYPES.value(type);
    }
    function typeforce(type, value, strict, surrogate) {
      if (NATIVE.Function(type)) {
        if (type(value, strict)) return true;
        throw new TfTypeError(surrogate || type, value);
      }
      return typeforce(compile(type), value, strict);
    }
    for (typeName in NATIVE) {
      typeforce[typeName] = NATIVE[typeName];
    }
    var typeName;
    for (typeName in TYPES) {
      typeforce[typeName] = TYPES[typeName];
    }
    var EXTRA = require_extra();
    for (typeName in EXTRA) {
      typeforce[typeName] = EXTRA[typeName];
    }
    typeforce.compile = compile;
    typeforce.TfTypeError = TfTypeError;
    typeforce.TfPropertyTypeError = TfPropertyTypeError;
    module2.exports = typeforce;
  }
});

// node_modules/bitcoinjs-lib/src/types.js
var require_types = __commonJS({
  "node_modules/bitcoinjs-lib/src/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.oneOf = exports2.Null = exports2.BufferN = exports2.Function = exports2.UInt32 = exports2.UInt8 = exports2.tuple = exports2.maybe = exports2.Hex = exports2.Buffer = exports2.String = exports2.Boolean = exports2.Array = exports2.Number = exports2.Hash256bit = exports2.Hash160bit = exports2.Buffer256bit = exports2.isTaptree = exports2.isTapleaf = exports2.TAPLEAF_VERSION_MASK = exports2.Satoshi = exports2.isPoint = exports2.stacksEqual = exports2.typeforce = void 0;
    var buffer_1 = require("buffer");
    exports2.typeforce = require_typeforce();
    var ZERO32 = buffer_1.Buffer.alloc(32, 0);
    var EC_P = buffer_1.Buffer.from(
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
      "hex"
    );
    function stacksEqual(a, b) {
      if (a.length !== b.length) return false;
      return a.every((x, i) => {
        return x.equals(b[i]);
      });
    }
    exports2.stacksEqual = stacksEqual;
    function isPoint(p) {
      if (!buffer_1.Buffer.isBuffer(p)) return false;
      if (p.length < 33) return false;
      const t = p[0];
      const x = p.slice(1, 33);
      if (x.compare(ZERO32) === 0) return false;
      if (x.compare(EC_P) >= 0) return false;
      if ((t === 2 || t === 3) && p.length === 33) {
        return true;
      }
      const y = p.slice(33);
      if (y.compare(ZERO32) === 0) return false;
      if (y.compare(EC_P) >= 0) return false;
      if (t === 4 && p.length === 65) return true;
      return false;
    }
    exports2.isPoint = isPoint;
    var SATOSHI_MAX = 21 * 1e14;
    function Satoshi(value) {
      return exports2.typeforce.UInt53(value) && value <= SATOSHI_MAX;
    }
    exports2.Satoshi = Satoshi;
    exports2.TAPLEAF_VERSION_MASK = 254;
    function isTapleaf(o) {
      if (!o || !("output" in o)) return false;
      if (!buffer_1.Buffer.isBuffer(o.output)) return false;
      if (o.version !== void 0)
        return (o.version & exports2.TAPLEAF_VERSION_MASK) === o.version;
      return true;
    }
    exports2.isTapleaf = isTapleaf;
    function isTaptree(scriptTree) {
      if (!(0, exports2.Array)(scriptTree)) return isTapleaf(scriptTree);
      if (scriptTree.length !== 2) return false;
      return scriptTree.every((t) => isTaptree(t));
    }
    exports2.isTaptree = isTaptree;
    exports2.Buffer256bit = exports2.typeforce.BufferN(32);
    exports2.Hash160bit = exports2.typeforce.BufferN(20);
    exports2.Hash256bit = exports2.typeforce.BufferN(32);
    exports2.Number = exports2.typeforce.Number;
    exports2.Array = exports2.typeforce.Array;
    exports2.Boolean = exports2.typeforce.Boolean;
    exports2.String = exports2.typeforce.String;
    exports2.Buffer = exports2.typeforce.Buffer;
    exports2.Hex = exports2.typeforce.Hex;
    exports2.maybe = exports2.typeforce.maybe;
    exports2.tuple = exports2.typeforce.tuple;
    exports2.UInt8 = exports2.typeforce.UInt8;
    exports2.UInt32 = exports2.typeforce.UInt32;
    exports2.Function = exports2.typeforce.Function;
    exports2.BufferN = exports2.typeforce.BufferN;
    exports2.Null = exports2.typeforce.Null;
    exports2.oneOf = exports2.typeforce.oneOf;
  }
});

// node_modules/bitcoinjs-lib/src/script_signature.js
var require_script_signature = __commonJS({
  "node_modules/bitcoinjs-lib/src/script_signature.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = exports2.decode = void 0;
    var bip66 = require_bip66();
    var script_1 = require_script();
    var types = require_types();
    var { typeforce } = types;
    var ZERO = Buffer.alloc(1, 0);
    function toDER(x) {
      let i = 0;
      while (x[i] === 0) ++i;
      if (i === x.length) return ZERO;
      x = x.slice(i);
      if (x[0] & 128) return Buffer.concat([ZERO, x], 1 + x.length);
      return x;
    }
    function fromDER(x) {
      if (x[0] === 0) x = x.slice(1);
      const buffer = Buffer.alloc(32, 0);
      const bstart = Math.max(0, 32 - x.length);
      x.copy(buffer, bstart);
      return buffer;
    }
    function decode2(buffer) {
      const hashType = buffer.readUInt8(buffer.length - 1);
      if (!(0, script_1.isDefinedHashType)(hashType)) {
        throw new Error("Invalid hashType " + hashType);
      }
      const decoded = bip66.decode(buffer.slice(0, -1));
      const r = fromDER(decoded.r);
      const s = fromDER(decoded.s);
      const signature = Buffer.concat([r, s], 64);
      return { signature, hashType };
    }
    exports2.decode = decode2;
    function encode2(signature, hashType) {
      typeforce(
        {
          signature: types.BufferN(64),
          hashType: types.UInt8
        },
        { signature, hashType }
      );
      if (!(0, script_1.isDefinedHashType)(hashType)) {
        throw new Error("Invalid hashType " + hashType);
      }
      const hashTypeBuffer = Buffer.allocUnsafe(1);
      hashTypeBuffer.writeUInt8(hashType, 0);
      const r = toDER(signature.slice(0, 32));
      const s = toDER(signature.slice(32, 64));
      return Buffer.concat([bip66.encode(r, s), hashTypeBuffer]);
    }
    exports2.encode = encode2;
  }
});

// node_modules/bitcoinjs-lib/src/script.js
var require_script = __commonJS({
  "node_modules/bitcoinjs-lib/src/script.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.signature = exports2.number = exports2.isCanonicalScriptSignature = exports2.isDefinedHashType = exports2.isCanonicalPubKey = exports2.toStack = exports2.fromASM = exports2.toASM = exports2.decompile = exports2.compile = exports2.countNonPushOnlyOPs = exports2.isPushOnly = exports2.OPS = void 0;
    var bip66 = require_bip66();
    var ops_1 = require_ops();
    Object.defineProperty(exports2, "OPS", {
      enumerable: true,
      get: function() {
        return ops_1.OPS;
      }
    });
    var pushdata = require_push_data();
    var scriptNumber = require_script_number();
    var scriptSignature = require_script_signature();
    var types = require_types();
    var { typeforce } = types;
    var OP_INT_BASE = ops_1.OPS.OP_RESERVED;
    function isOPInt(value) {
      return types.Number(value) && (value === ops_1.OPS.OP_0 || value >= ops_1.OPS.OP_1 && value <= ops_1.OPS.OP_16 || value === ops_1.OPS.OP_1NEGATE);
    }
    function isPushOnlyChunk(value) {
      return types.Buffer(value) || isOPInt(value);
    }
    function isPushOnly(value) {
      return types.Array(value) && value.every(isPushOnlyChunk);
    }
    exports2.isPushOnly = isPushOnly;
    function countNonPushOnlyOPs(value) {
      return value.length - value.filter(isPushOnlyChunk).length;
    }
    exports2.countNonPushOnlyOPs = countNonPushOnlyOPs;
    function asMinimalOP(buffer) {
      if (buffer.length === 0) return ops_1.OPS.OP_0;
      if (buffer.length !== 1) return;
      if (buffer[0] >= 1 && buffer[0] <= 16) return OP_INT_BASE + buffer[0];
      if (buffer[0] === 129) return ops_1.OPS.OP_1NEGATE;
    }
    function chunksIsBuffer(buf) {
      return Buffer.isBuffer(buf);
    }
    function chunksIsArray(buf) {
      return types.Array(buf);
    }
    function singleChunkIsBuffer(buf) {
      return Buffer.isBuffer(buf);
    }
    function compile(chunks) {
      if (chunksIsBuffer(chunks)) return chunks;
      typeforce(types.Array, chunks);
      const bufferSize = chunks.reduce((accum, chunk) => {
        if (singleChunkIsBuffer(chunk)) {
          if (chunk.length === 1 && asMinimalOP(chunk) !== void 0) {
            return accum + 1;
          }
          return accum + pushdata.encodingLength(chunk.length) + chunk.length;
        }
        return accum + 1;
      }, 0);
      const buffer = Buffer.allocUnsafe(bufferSize);
      let offset = 0;
      chunks.forEach((chunk) => {
        if (singleChunkIsBuffer(chunk)) {
          const opcode = asMinimalOP(chunk);
          if (opcode !== void 0) {
            buffer.writeUInt8(opcode, offset);
            offset += 1;
            return;
          }
          offset += pushdata.encode(buffer, chunk.length, offset);
          chunk.copy(buffer, offset);
          offset += chunk.length;
        } else {
          buffer.writeUInt8(chunk, offset);
          offset += 1;
        }
      });
      if (offset !== buffer.length) throw new Error("Could not decode chunks");
      return buffer;
    }
    exports2.compile = compile;
    function decompile(buffer) {
      if (chunksIsArray(buffer)) return buffer;
      typeforce(types.Buffer, buffer);
      const chunks = [];
      let i = 0;
      while (i < buffer.length) {
        const opcode = buffer[i];
        if (opcode > ops_1.OPS.OP_0 && opcode <= ops_1.OPS.OP_PUSHDATA4) {
          const d = pushdata.decode(buffer, i);
          if (d === null) return null;
          i += d.size;
          if (i + d.number > buffer.length) return null;
          const data = buffer.slice(i, i + d.number);
          i += d.number;
          const op = asMinimalOP(data);
          if (op !== void 0) {
            chunks.push(op);
          } else {
            chunks.push(data);
          }
        } else {
          chunks.push(opcode);
          i += 1;
        }
      }
      return chunks;
    }
    exports2.decompile = decompile;
    function toASM(chunks) {
      if (chunksIsBuffer(chunks)) {
        chunks = decompile(chunks);
      }
      if (!chunks) {
        throw new Error("Could not convert invalid chunks to ASM");
      }
      return chunks.map((chunk) => {
        if (singleChunkIsBuffer(chunk)) {
          const op = asMinimalOP(chunk);
          if (op === void 0) return chunk.toString("hex");
          chunk = op;
        }
        return ops_1.REVERSE_OPS[chunk];
      }).join(" ");
    }
    exports2.toASM = toASM;
    function fromASM(asm) {
      typeforce(types.String, asm);
      return compile(
        asm.split(" ").map((chunkStr) => {
          if (ops_1.OPS[chunkStr] !== void 0) return ops_1.OPS[chunkStr];
          typeforce(types.Hex, chunkStr);
          return Buffer.from(chunkStr, "hex");
        })
      );
    }
    exports2.fromASM = fromASM;
    function toStack(chunks) {
      chunks = decompile(chunks);
      typeforce(isPushOnly, chunks);
      return chunks.map((op) => {
        if (singleChunkIsBuffer(op)) return op;
        if (op === ops_1.OPS.OP_0) return Buffer.allocUnsafe(0);
        return scriptNumber.encode(op - OP_INT_BASE);
      });
    }
    exports2.toStack = toStack;
    function isCanonicalPubKey(buffer) {
      return types.isPoint(buffer);
    }
    exports2.isCanonicalPubKey = isCanonicalPubKey;
    function isDefinedHashType(hashType) {
      const hashTypeMod = hashType & ~128;
      return hashTypeMod > 0 && hashTypeMod < 4;
    }
    exports2.isDefinedHashType = isDefinedHashType;
    function isCanonicalScriptSignature(buffer) {
      if (!Buffer.isBuffer(buffer)) return false;
      if (!isDefinedHashType(buffer[buffer.length - 1])) return false;
      return bip66.check(buffer.slice(0, -1));
    }
    exports2.isCanonicalScriptSignature = isCanonicalScriptSignature;
    exports2.number = scriptNumber;
    exports2.signature = scriptSignature;
  }
});

// node_modules/bitcoinjs-lib/src/payments/lazy.js
var require_lazy = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/lazy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.value = exports2.prop = void 0;
    function prop(object2, name, f) {
      Object.defineProperty(object2, name, {
        configurable: true,
        enumerable: true,
        get() {
          const _value = f.call(this);
          this[name] = _value;
          return _value;
        },
        set(_value) {
          Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            value: _value,
            writable: true
          });
        }
      });
    }
    exports2.prop = prop;
    function value(f) {
      let _value;
      return () => {
        if (_value !== void 0) return _value;
        _value = f();
        return _value;
      };
    }
    exports2.value = value;
  }
});

// node_modules/bitcoinjs-lib/src/payments/embed.js
var require_embed = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/embed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2data = void 0;
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var OPS = bscript.OPS;
    function p2data(a, opts) {
      if (!a.data && !a.output) throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
          data: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
          )
        },
        a
      );
      const network = a.network || networks_1.bitcoin;
      const o = { name: "embed", network };
      lazy.prop(o, "output", () => {
        if (!a.data) return;
        return bscript.compile([OPS.OP_RETURN].concat(a.data));
      });
      lazy.prop(o, "data", () => {
        if (!a.output) return;
        return bscript.decompile(a.output).slice(1);
      });
      if (opts.validate) {
        if (a.output) {
          const chunks = bscript.decompile(a.output);
          if (chunks[0] !== OPS.OP_RETURN) throw new TypeError("Output is invalid");
          if (!chunks.slice(1).every(types_1.typeforce.Buffer))
            throw new TypeError("Output is invalid");
          if (a.data && !(0, types_1.stacksEqual)(a.data, o.data))
            throw new TypeError("Data mismatch");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2data = p2data;
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2ms.js
var require_p2ms = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2ms.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2ms = void 0;
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var OPS = bscript.OPS;
    var OP_INT_BASE = OPS.OP_RESERVED;
    function p2ms(a, opts) {
      if (!a.input && !a.output && !(a.pubkeys && a.m !== void 0) && !a.signatures)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      function isAcceptableSignature(x) {
        return bscript.isCanonicalScriptSignature(x) || (opts.allowIncomplete && x === OPS.OP_0) !== void 0;
      }
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          m: types_1.typeforce.maybe(types_1.typeforce.Number),
          n: types_1.typeforce.maybe(types_1.typeforce.Number),
          output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
          pubkeys: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.isPoint)
          ),
          signatures: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(isAcceptableSignature)
          ),
          input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
        },
        a
      );
      const network = a.network || networks_1.bitcoin;
      const o = { network };
      let chunks = [];
      let decoded = false;
      function decode2(output) {
        if (decoded) return;
        decoded = true;
        chunks = bscript.decompile(output);
        o.m = chunks[0] - OP_INT_BASE;
        o.n = chunks[chunks.length - 2] - OP_INT_BASE;
        o.pubkeys = chunks.slice(1, -2);
      }
      lazy.prop(o, "output", () => {
        if (!a.m) return;
        if (!o.n) return;
        if (!a.pubkeys) return;
        return bscript.compile(
          [].concat(
            OP_INT_BASE + a.m,
            a.pubkeys,
            OP_INT_BASE + o.n,
            OPS.OP_CHECKMULTISIG
          )
        );
      });
      lazy.prop(o, "m", () => {
        if (!o.output) return;
        decode2(o.output);
        return o.m;
      });
      lazy.prop(o, "n", () => {
        if (!o.pubkeys) return;
        return o.pubkeys.length;
      });
      lazy.prop(o, "pubkeys", () => {
        if (!a.output) return;
        decode2(a.output);
        return o.pubkeys;
      });
      lazy.prop(o, "signatures", () => {
        if (!a.input) return;
        return bscript.decompile(a.input).slice(1);
      });
      lazy.prop(o, "input", () => {
        if (!a.signatures) return;
        return bscript.compile([OPS.OP_0].concat(a.signatures));
      });
      lazy.prop(o, "witness", () => {
        if (!o.input) return;
        return [];
      });
      lazy.prop(o, "name", () => {
        if (!o.m || !o.n) return;
        return `p2ms(${o.m} of ${o.n})`;
      });
      if (opts.validate) {
        if (a.output) {
          decode2(a.output);
          if (!types_1.typeforce.Number(chunks[0]))
            throw new TypeError("Output is invalid");
          if (!types_1.typeforce.Number(chunks[chunks.length - 2]))
            throw new TypeError("Output is invalid");
          if (chunks[chunks.length - 1] !== OPS.OP_CHECKMULTISIG)
            throw new TypeError("Output is invalid");
          if (o.m <= 0 || o.n > 16 || o.m > o.n || o.n !== chunks.length - 3)
            throw new TypeError("Output is invalid");
          if (!o.pubkeys.every((x) => (0, types_1.isPoint)(x)))
            throw new TypeError("Output is invalid");
          if (a.m !== void 0 && a.m !== o.m) throw new TypeError("m mismatch");
          if (a.n !== void 0 && a.n !== o.n) throw new TypeError("n mismatch");
          if (a.pubkeys && !(0, types_1.stacksEqual)(a.pubkeys, o.pubkeys))
            throw new TypeError("Pubkeys mismatch");
        }
        if (a.pubkeys) {
          if (a.n !== void 0 && a.n !== a.pubkeys.length)
            throw new TypeError("Pubkey count mismatch");
          o.n = a.pubkeys.length;
          if (o.n < o.m) throw new TypeError("Pubkey count cannot be less than m");
        }
        if (a.signatures) {
          if (a.signatures.length < o.m)
            throw new TypeError("Not enough signatures provided");
          if (a.signatures.length > o.m)
            throw new TypeError("Too many signatures provided");
        }
        if (a.input) {
          if (a.input[0] !== OPS.OP_0) throw new TypeError("Input is invalid");
          if (o.signatures.length === 0 || !o.signatures.every(isAcceptableSignature))
            throw new TypeError("Input has invalid signature(s)");
          if (a.signatures && !(0, types_1.stacksEqual)(a.signatures, o.signatures))
            throw new TypeError("Signature mismatch");
          if (a.m !== void 0 && a.m !== a.signatures.length)
            throw new TypeError("Signature count mismatch");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2ms = p2ms;
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2pk.js
var require_p2pk = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2pk.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2pk = void 0;
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var OPS = bscript.OPS;
    function p2pk(a, opts) {
      if (!a.input && !a.output && !a.pubkey && !a.input && !a.signature)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
          pubkey: types_1.typeforce.maybe(types_1.isPoint),
          signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
          input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
        },
        a
      );
      const _chunks = lazy.value(() => {
        return bscript.decompile(a.input);
      });
      const network = a.network || networks_1.bitcoin;
      const o = { name: "p2pk", network };
      lazy.prop(o, "output", () => {
        if (!a.pubkey) return;
        return bscript.compile([a.pubkey, OPS.OP_CHECKSIG]);
      });
      lazy.prop(o, "pubkey", () => {
        if (!a.output) return;
        return a.output.slice(1, -1);
      });
      lazy.prop(o, "signature", () => {
        if (!a.input) return;
        return _chunks()[0];
      });
      lazy.prop(o, "input", () => {
        if (!a.signature) return;
        return bscript.compile([a.signature]);
      });
      lazy.prop(o, "witness", () => {
        if (!o.input) return;
        return [];
      });
      if (opts.validate) {
        if (a.output) {
          if (a.output[a.output.length - 1] !== OPS.OP_CHECKSIG)
            throw new TypeError("Output is invalid");
          if (!(0, types_1.isPoint)(o.pubkey))
            throw new TypeError("Output pubkey is invalid");
          if (a.pubkey && !a.pubkey.equals(o.pubkey))
            throw new TypeError("Pubkey mismatch");
        }
        if (a.signature) {
          if (a.input && !a.input.equals(o.input))
            throw new TypeError("Signature mismatch");
        }
        if (a.input) {
          if (_chunks().length !== 1) throw new TypeError("Input is invalid");
          if (!bscript.isCanonicalScriptSignature(o.signature))
            throw new TypeError("Input has invalid signature");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2pk = p2pk;
  }
});

// node_modules/@noble/hashes/cryptoNode.js
var require_cryptoNode = __commonJS({
  "node_modules/@noble/hashes/cryptoNode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crypto = void 0;
    var nc = require("node:crypto");
    exports2.crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && "randomBytes" in nc ? nc : void 0;
  }
});

// node_modules/@noble/hashes/utils.js
var require_utils = __commonJS({
  "node_modules/@noble/hashes/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.wrapXOFConstructorWithOpts = exports2.wrapConstructorWithOpts = exports2.wrapConstructor = exports2.Hash = exports2.nextTick = exports2.swap32IfBE = exports2.byteSwapIfBE = exports2.swap8IfBE = exports2.isLE = void 0;
    exports2.isBytes = isBytes3;
    exports2.anumber = anumber2;
    exports2.abytes = abytes3;
    exports2.ahash = ahash;
    exports2.aexists = aexists3;
    exports2.aoutput = aoutput3;
    exports2.u8 = u8;
    exports2.u32 = u322;
    exports2.clean = clean3;
    exports2.createView = createView2;
    exports2.rotr = rotr2;
    exports2.rotl = rotl;
    exports2.byteSwap = byteSwap2;
    exports2.byteSwap32 = byteSwap322;
    exports2.bytesToHex = bytesToHex;
    exports2.hexToBytes = hexToBytes;
    exports2.asyncLoop = asyncLoop;
    exports2.utf8ToBytes = utf8ToBytes2;
    exports2.bytesToUtf8 = bytesToUtf8;
    exports2.toBytes = toBytes2;
    exports2.kdfInputToBytes = kdfInputToBytes;
    exports2.concatBytes = concatBytes2;
    exports2.checkOpts = checkOpts;
    exports2.createHasher = createHasher3;
    exports2.createOptHasher = createOptHasher;
    exports2.createXOFer = createXOFer;
    exports2.randomBytes = randomBytes3;
    var crypto_1 = require_cryptoNode();
    function isBytes3(a) {
      return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
    }
    function anumber2(n) {
      if (!Number.isSafeInteger(n) || n < 0)
        throw new Error("positive integer expected, got " + n);
    }
    function abytes3(b, ...lengths) {
      if (!isBytes3(b))
        throw new Error("Uint8Array expected");
      if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
    }
    function ahash(h2) {
      if (typeof h2 !== "function" || typeof h2.create !== "function")
        throw new Error("Hash should be wrapped by utils.createHasher");
      anumber2(h2.outputLen);
      anumber2(h2.blockLen);
    }
    function aexists3(instance2, checkFinished = true) {
      if (instance2.destroyed)
        throw new Error("Hash instance has been destroyed");
      if (checkFinished && instance2.finished)
        throw new Error("Hash#digest() has already been called");
    }
    function aoutput3(out, instance2) {
      abytes3(out);
      const min = instance2.outputLen;
      if (out.length < min) {
        throw new Error("digestInto() expects output buffer of length at least " + min);
      }
    }
    function u8(arr) {
      return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    }
    function u322(arr) {
      return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
    }
    function clean3(...arrays) {
      for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0);
      }
    }
    function createView2(arr) {
      return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    }
    function rotr2(word, shift) {
      return word << 32 - shift | word >>> shift;
    }
    function rotl(word, shift) {
      return word << shift | word >>> 32 - shift >>> 0;
    }
    exports2.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    function byteSwap2(word) {
      return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
    }
    exports2.swap8IfBE = exports2.isLE ? (n) => n : (n) => byteSwap2(n);
    exports2.byteSwapIfBE = exports2.swap8IfBE;
    function byteSwap322(arr) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = byteSwap2(arr[i]);
      }
      return arr;
    }
    exports2.swap32IfBE = exports2.isLE ? (u) => u : byteSwap322;
    var hasHexBuiltin = /* @__PURE__ */ (() => (
      // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
    ))();
    var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    function bytesToHex(bytes) {
      abytes3(bytes);
      if (hasHexBuiltin)
        return bytes.toHex();
      let hex = "";
      for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
      }
      return hex;
    }
    var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    function asciiToBase16(ch) {
      if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0;
      if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10);
      if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10);
      return;
    }
    function hexToBytes(hex) {
      if (typeof hex !== "string")
        throw new Error("hex string expected, got " + typeof hex);
      if (hasHexBuiltin)
        return Uint8Array.fromHex(hex);
      const hl = hex.length;
      const al = hl / 2;
      if (hl % 2)
        throw new Error("hex string expected, got unpadded hex of length " + hl);
      const array = new Uint8Array(al);
      for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === void 0 || n2 === void 0) {
          const char = hex[hi] + hex[hi + 1];
          throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2;
      }
      return array;
    }
    var nextTick = async () => {
    };
    exports2.nextTick = nextTick;
    async function asyncLoop(iters, tick, cb) {
      let ts = Date.now();
      for (let i = 0; i < iters; i++) {
        cb(i);
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
          continue;
        await (0, exports2.nextTick)();
        ts += diff;
      }
    }
    function utf8ToBytes2(str) {
      if (typeof str !== "string")
        throw new Error("string expected");
      return new Uint8Array(new TextEncoder().encode(str));
    }
    function bytesToUtf8(bytes) {
      return new TextDecoder().decode(bytes);
    }
    function toBytes2(data) {
      if (typeof data === "string")
        data = utf8ToBytes2(data);
      abytes3(data);
      return data;
    }
    function kdfInputToBytes(data) {
      if (typeof data === "string")
        data = utf8ToBytes2(data);
      abytes3(data);
      return data;
    }
    function concatBytes2(...arrays) {
      let sum = 0;
      for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        abytes3(a);
        sum += a.length;
      }
      const res = new Uint8Array(sum);
      for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
      }
      return res;
    }
    function checkOpts(defaults, opts) {
      if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
        throw new Error("options should be object or undefined");
      const merged = Object.assign(defaults, opts);
      return merged;
    }
    var Hash2 = class {
    };
    exports2.Hash = Hash2;
    function createHasher3(hashCons) {
      const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
      const tmp = hashCons();
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = () => hashCons();
      return hashC;
    }
    function createOptHasher(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      return hashC;
    }
    function createXOFer(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      return hashC;
    }
    exports2.wrapConstructor = createHasher3;
    exports2.wrapConstructorWithOpts = createOptHasher;
    exports2.wrapXOFConstructorWithOpts = createXOFer;
    function randomBytes3(bytesLength = 32) {
      if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
        return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
      }
      if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") {
        return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
      }
      throw new Error("crypto.getRandomValues must be defined");
    }
  }
});

// node_modules/@noble/hashes/_md.js
var require_md = __commonJS({
  "node_modules/@noble/hashes/_md.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SHA512_IV = exports2.SHA384_IV = exports2.SHA224_IV = exports2.SHA256_IV = exports2.HashMD = void 0;
    exports2.setBigUint64 = setBigUint642;
    exports2.Chi = Chi2;
    exports2.Maj = Maj2;
    var utils_ts_1 = require_utils();
    function setBigUint642(view, byteOffset, value, isLE2) {
      if (typeof view.setBigUint64 === "function")
        return view.setBigUint64(byteOffset, value, isLE2);
      const _32n2 = BigInt(32);
      const _u32_max = BigInt(4294967295);
      const wh = Number(value >> _32n2 & _u32_max);
      const wl = Number(value & _u32_max);
      const h2 = isLE2 ? 4 : 0;
      const l = isLE2 ? 0 : 4;
      view.setUint32(byteOffset + h2, wh, isLE2);
      view.setUint32(byteOffset + l, wl, isLE2);
    }
    function Chi2(a, b, c) {
      return a & b ^ ~a & c;
    }
    function Maj2(a, b, c) {
      return a & b ^ a & c ^ b & c;
    }
    var HashMD2 = class extends utils_ts_1.Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0, utils_ts_1.createView)(this.buffer);
      }
      update(data) {
        (0, utils_ts_1.aexists)(this);
        data = (0, utils_ts_1.toBytes)(data);
        (0, utils_ts_1.abytes)(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = (0, utils_ts_1.createView)(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        (0, utils_ts_1.aexists)(this);
        (0, utils_ts_1.aoutput)(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        (0, utils_ts_1.clean)(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = (0, utils_ts_1.createView)(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length2;
        to.pos = pos;
        if (length2 % blockLen)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    exports2.HashMD = HashMD2;
    exports2.SHA256_IV = Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    exports2.SHA224_IV = Uint32Array.from([
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428
    ]);
    exports2.SHA384_IV = Uint32Array.from([
      3418070365,
      3238371032,
      1654270250,
      914150663,
      2438529370,
      812702999,
      355462360,
      4144912697,
      1731405415,
      4290775857,
      2394180231,
      1750603025,
      3675008525,
      1694076839,
      1203062813,
      3204075428
    ]);
    exports2.SHA512_IV = Uint32Array.from([
      1779033703,
      4089235720,
      3144134277,
      2227873595,
      1013904242,
      4271175723,
      2773480762,
      1595750129,
      1359893119,
      2917565137,
      2600822924,
      725511199,
      528734635,
      4215389547,
      1541459225,
      327033209
    ]);
  }
});

// node_modules/@noble/hashes/legacy.js
var require_legacy = __commonJS({
  "node_modules/@noble/hashes/legacy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ripemd160 = exports2.RIPEMD160 = exports2.md5 = exports2.MD5 = exports2.sha1 = exports2.SHA1 = void 0;
    var _md_ts_1 = require_md();
    var utils_ts_1 = require_utils();
    var SHA1_IV = /* @__PURE__ */ Uint32Array.from([
      1732584193,
      4023233417,
      2562383102,
      271733878,
      3285377520
    ]);
    var SHA1_W = /* @__PURE__ */ new Uint32Array(80);
    var SHA1 = class extends _md_ts_1.HashMD {
      constructor() {
        super(64, 20, 8, false);
        this.A = SHA1_IV[0] | 0;
        this.B = SHA1_IV[1] | 0;
        this.C = SHA1_IV[2] | 0;
        this.D = SHA1_IV[3] | 0;
        this.E = SHA1_IV[4] | 0;
      }
      get() {
        const { A, B, C, D: D2, E } = this;
        return [A, B, C, D2, E];
      }
      set(A, B, C, D2, E) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D2 | 0;
        this.E = E | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA1_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 80; i++)
          SHA1_W[i] = (0, utils_ts_1.rotl)(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
        let { A, B, C, D: D2, E } = this;
        for (let i = 0; i < 80; i++) {
          let F2, K2;
          if (i < 20) {
            F2 = (0, _md_ts_1.Chi)(B, C, D2);
            K2 = 1518500249;
          } else if (i < 40) {
            F2 = B ^ C ^ D2;
            K2 = 1859775393;
          } else if (i < 60) {
            F2 = (0, _md_ts_1.Maj)(B, C, D2);
            K2 = 2400959708;
          } else {
            F2 = B ^ C ^ D2;
            K2 = 3395469782;
          }
          const T = (0, utils_ts_1.rotl)(A, 5) + F2 + E + K2 + SHA1_W[i] | 0;
          E = D2;
          D2 = C;
          C = (0, utils_ts_1.rotl)(B, 30);
          B = A;
          A = T;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D2 = D2 + this.D | 0;
        E = E + this.E | 0;
        this.set(A, B, C, D2, E);
      }
      roundClean() {
        (0, utils_ts_1.clean)(SHA1_W);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0);
        (0, utils_ts_1.clean)(this.buffer);
      }
    };
    exports2.SHA1 = SHA1;
    exports2.sha1 = (0, utils_ts_1.createHasher)(() => new SHA1());
    var p32 = /* @__PURE__ */ Math.pow(2, 32);
    var K = /* @__PURE__ */ Array.from({ length: 64 }, (_, i) => Math.floor(p32 * Math.abs(Math.sin(i + 1))));
    var MD5_IV = /* @__PURE__ */ SHA1_IV.slice(0, 4);
    var MD5_W = /* @__PURE__ */ new Uint32Array(16);
    var MD5 = class extends _md_ts_1.HashMD {
      constructor() {
        super(64, 16, 8, true);
        this.A = MD5_IV[0] | 0;
        this.B = MD5_IV[1] | 0;
        this.C = MD5_IV[2] | 0;
        this.D = MD5_IV[3] | 0;
      }
      get() {
        const { A, B, C, D: D2 } = this;
        return [A, B, C, D2];
      }
      set(A, B, C, D2) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D2 | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          MD5_W[i] = view.getUint32(offset, true);
        let { A, B, C, D: D2 } = this;
        for (let i = 0; i < 64; i++) {
          let F2, g, s;
          if (i < 16) {
            F2 = (0, _md_ts_1.Chi)(B, C, D2);
            g = i;
            s = [7, 12, 17, 22];
          } else if (i < 32) {
            F2 = (0, _md_ts_1.Chi)(D2, B, C);
            g = (5 * i + 1) % 16;
            s = [5, 9, 14, 20];
          } else if (i < 48) {
            F2 = B ^ C ^ D2;
            g = (3 * i + 5) % 16;
            s = [4, 11, 16, 23];
          } else {
            F2 = C ^ (B | ~D2);
            g = 7 * i % 16;
            s = [6, 10, 15, 21];
          }
          F2 = F2 + A + K[i] + MD5_W[g];
          A = D2;
          D2 = C;
          C = B;
          B = B + (0, utils_ts_1.rotl)(F2, s[i % 4]);
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D2 = D2 + this.D | 0;
        this.set(A, B, C, D2);
      }
      roundClean() {
        (0, utils_ts_1.clean)(MD5_W);
      }
      destroy() {
        this.set(0, 0, 0, 0);
        (0, utils_ts_1.clean)(this.buffer);
      }
    };
    exports2.MD5 = MD5;
    exports2.md5 = (0, utils_ts_1.createHasher)(() => new MD5());
    var Rho160 = /* @__PURE__ */ Uint8Array.from([
      7,
      4,
      13,
      1,
      10,
      6,
      15,
      3,
      12,
      0,
      9,
      5,
      2,
      14,
      11,
      8
    ]);
    var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
    var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
    var idxLR = /* @__PURE__ */ (() => {
      const L = [Id160];
      const R = [Pi160];
      const res = [L, R];
      for (let i = 0; i < 4; i++)
        for (let j of res)
          j.push(j[i].map((k) => Rho160[k]));
      return res;
    })();
    var idxL = /* @__PURE__ */ (() => idxLR[0])();
    var idxR = /* @__PURE__ */ (() => idxLR[1])();
    var shifts160 = /* @__PURE__ */ [
      [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
      [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
      [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
      [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
      [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
    ].map((i) => Uint8Array.from(i));
    var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
    var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
    var Kl160 = /* @__PURE__ */ Uint32Array.from([
      0,
      1518500249,
      1859775393,
      2400959708,
      2840853838
    ]);
    var Kr160 = /* @__PURE__ */ Uint32Array.from([
      1352829926,
      1548603684,
      1836072691,
      2053994217,
      0
    ]);
    function ripemd_f(group, x, y, z) {
      if (group === 0)
        return x ^ y ^ z;
      if (group === 1)
        return x & y | ~x & z;
      if (group === 2)
        return (x | ~y) ^ z;
      if (group === 3)
        return x & z | y & ~z;
      return x ^ (y | ~z);
    }
    var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
    var RIPEMD160 = class extends _md_ts_1.HashMD {
      constructor() {
        super(64, 20, 8, true);
        this.h0 = 1732584193 | 0;
        this.h1 = 4023233417 | 0;
        this.h2 = 2562383102 | 0;
        this.h3 = 271733878 | 0;
        this.h4 = 3285377520 | 0;
      }
      get() {
        const { h0, h1, h2, h3, h4 } = this;
        return [h0, h1, h2, h3, h4];
      }
      set(h0, h1, h2, h3, h4) {
        this.h0 = h0 | 0;
        this.h1 = h1 | 0;
        this.h2 = h2 | 0;
        this.h3 = h3 | 0;
        this.h4 = h4 | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          BUF_160[i] = view.getUint32(offset, true);
        let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
        for (let group = 0; group < 5; group++) {
          const rGroup = 4 - group;
          const hbl = Kl160[group], hbr = Kr160[group];
          const rl = idxL[group], rr = idxR[group];
          const sl = shiftsL160[group], sr = shiftsR160[group];
          for (let i = 0; i < 16; i++) {
            const tl = (0, utils_ts_1.rotl)(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
            al = el, el = dl, dl = (0, utils_ts_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
          }
          for (let i = 0; i < 16; i++) {
            const tr = (0, utils_ts_1.rotl)(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
            ar = er, er = dr, dr = (0, utils_ts_1.rotl)(cr, 10) | 0, cr = br, br = tr;
          }
        }
        this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
      }
      roundClean() {
        (0, utils_ts_1.clean)(BUF_160);
      }
      destroy() {
        this.destroyed = true;
        (0, utils_ts_1.clean)(this.buffer);
        this.set(0, 0, 0, 0, 0);
      }
    };
    exports2.RIPEMD160 = RIPEMD160;
    exports2.ripemd160 = (0, utils_ts_1.createHasher)(() => new RIPEMD160());
  }
});

// node_modules/@noble/hashes/ripemd160.js
var require_ripemd160 = __commonJS({
  "node_modules/@noble/hashes/ripemd160.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ripemd160 = exports2.RIPEMD160 = void 0;
    var legacy_ts_1 = require_legacy();
    exports2.RIPEMD160 = legacy_ts_1.RIPEMD160;
    exports2.ripemd160 = legacy_ts_1.ripemd160;
  }
});

// node_modules/@noble/hashes/sha1.js
var require_sha1 = __commonJS({
  "node_modules/@noble/hashes/sha1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sha1 = exports2.SHA1 = void 0;
    var legacy_ts_1 = require_legacy();
    exports2.SHA1 = legacy_ts_1.SHA1;
    exports2.sha1 = legacy_ts_1.sha1;
  }
});

// node_modules/@noble/hashes/_u64.js
var require_u64 = __commonJS({
  "node_modules/@noble/hashes/_u64.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toBig = exports2.shrSL = exports2.shrSH = exports2.rotrSL = exports2.rotrSH = exports2.rotrBL = exports2.rotrBH = exports2.rotr32L = exports2.rotr32H = exports2.rotlSL = exports2.rotlSH = exports2.rotlBL = exports2.rotlBH = exports2.add5L = exports2.add5H = exports2.add4L = exports2.add4H = exports2.add3L = exports2.add3H = void 0;
    exports2.add = add;
    exports2.fromBig = fromBig2;
    exports2.split = split2;
    var U32_MASK642 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    var _32n2 = /* @__PURE__ */ BigInt(32);
    function fromBig2(n, le = false) {
      if (le)
        return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
      return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
    }
    function split2(lst, le = false) {
      const len = lst.length;
      let Ah = new Uint32Array(len);
      let Al = new Uint32Array(len);
      for (let i = 0; i < len; i++) {
        const { h: h2, l } = fromBig2(lst[i], le);
        [Ah[i], Al[i]] = [h2, l];
      }
      return [Ah, Al];
    }
    var toBig = (h2, l) => BigInt(h2 >>> 0) << _32n2 | BigInt(l >>> 0);
    exports2.toBig = toBig;
    var shrSH = (h2, _l, s) => h2 >>> s;
    exports2.shrSH = shrSH;
    var shrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
    exports2.shrSL = shrSL;
    var rotrSH = (h2, l, s) => h2 >>> s | l << 32 - s;
    exports2.rotrSH = rotrSH;
    var rotrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
    exports2.rotrSL = rotrSL;
    var rotrBH = (h2, l, s) => h2 << 64 - s | l >>> s - 32;
    exports2.rotrBH = rotrBH;
    var rotrBL = (h2, l, s) => h2 >>> s - 32 | l << 64 - s;
    exports2.rotrBL = rotrBL;
    var rotr32H = (_h, l) => l;
    exports2.rotr32H = rotr32H;
    var rotr32L = (h2, _l) => h2;
    exports2.rotr32L = rotr32L;
    var rotlSH2 = (h2, l, s) => h2 << s | l >>> 32 - s;
    exports2.rotlSH = rotlSH2;
    var rotlSL2 = (h2, l, s) => l << s | h2 >>> 32 - s;
    exports2.rotlSL = rotlSL2;
    var rotlBH2 = (h2, l, s) => l << s - 32 | h2 >>> 64 - s;
    exports2.rotlBH = rotlBH2;
    var rotlBL2 = (h2, l, s) => h2 << s - 32 | l >>> 64 - s;
    exports2.rotlBL = rotlBL2;
    function add(Ah, Al, Bh, Bl) {
      const l = (Al >>> 0) + (Bl >>> 0);
      return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
    }
    var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    exports2.add3L = add3L;
    var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
    exports2.add3H = add3H;
    var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    exports2.add4L = add4L;
    var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
    exports2.add4H = add4H;
    var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    exports2.add5L = add5L;
    var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
    exports2.add5H = add5H;
    var u64 = {
      fromBig: fromBig2,
      split: split2,
      toBig,
      shrSH,
      shrSL,
      rotrSH,
      rotrSL,
      rotrBH,
      rotrBL,
      rotr32H,
      rotr32L,
      rotlSH: rotlSH2,
      rotlSL: rotlSL2,
      rotlBH: rotlBH2,
      rotlBL: rotlBL2,
      add,
      add3L,
      add3H,
      add4L,
      add4H,
      add5H,
      add5L
    };
    exports2.default = u64;
  }
});

// node_modules/@noble/hashes/sha2.js
var require_sha2 = __commonJS({
  "node_modules/@noble/hashes/sha2.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sha512_224 = exports2.sha512_256 = exports2.sha384 = exports2.sha512 = exports2.sha224 = exports2.sha256 = exports2.SHA512_256 = exports2.SHA512_224 = exports2.SHA384 = exports2.SHA512 = exports2.SHA224 = exports2.SHA256 = void 0;
    var _md_ts_1 = require_md();
    var u64 = require_u64();
    var utils_ts_1 = require_utils();
    var SHA256_K2 = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    var SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
    var SHA2562 = class extends _md_ts_1.HashMD {
      constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        this.A = _md_ts_1.SHA256_IV[0] | 0;
        this.B = _md_ts_1.SHA256_IV[1] | 0;
        this.C = _md_ts_1.SHA256_IV[2] | 0;
        this.D = _md_ts_1.SHA256_IV[3] | 0;
        this.E = _md_ts_1.SHA256_IV[4] | 0;
        this.F = _md_ts_1.SHA256_IV[5] | 0;
        this.G = _md_ts_1.SHA256_IV[6] | 0;
        this.H = _md_ts_1.SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D: D2, E, F: F2, G, H } = this;
        return [A, B, C, D2, E, F2, G, H];
      }
      // prettier-ignore
      set(A, B, C, D2, E, F2, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D2 | 0;
        this.E = E | 0;
        this.F = F2 | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W2[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W2[i - 15];
          const W2 = SHA256_W2[i - 2];
          const s0 = (0, utils_ts_1.rotr)(W15, 7) ^ (0, utils_ts_1.rotr)(W15, 18) ^ W15 >>> 3;
          const s1 = (0, utils_ts_1.rotr)(W2, 17) ^ (0, utils_ts_1.rotr)(W2, 19) ^ W2 >>> 10;
          SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
        }
        let { A, B, C, D: D2, E, F: F2, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = (0, utils_ts_1.rotr)(E, 6) ^ (0, utils_ts_1.rotr)(E, 11) ^ (0, utils_ts_1.rotr)(E, 25);
          const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F2, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
          const sigma0 = (0, utils_ts_1.rotr)(A, 2) ^ (0, utils_ts_1.rotr)(A, 13) ^ (0, utils_ts_1.rotr)(A, 22);
          const T2 = sigma0 + (0, _md_ts_1.Maj)(A, B, C) | 0;
          H = G;
          G = F2;
          F2 = E;
          E = D2 + T1 | 0;
          D2 = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D2 = D2 + this.D | 0;
        E = E + this.E | 0;
        F2 = F2 + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D2, E, F2, G, H);
      }
      roundClean() {
        (0, utils_ts_1.clean)(SHA256_W2);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        (0, utils_ts_1.clean)(this.buffer);
      }
    };
    exports2.SHA256 = SHA2562;
    var SHA2242 = class extends SHA2562 {
      constructor() {
        super(28);
        this.A = _md_ts_1.SHA224_IV[0] | 0;
        this.B = _md_ts_1.SHA224_IV[1] | 0;
        this.C = _md_ts_1.SHA224_IV[2] | 0;
        this.D = _md_ts_1.SHA224_IV[3] | 0;
        this.E = _md_ts_1.SHA224_IV[4] | 0;
        this.F = _md_ts_1.SHA224_IV[5] | 0;
        this.G = _md_ts_1.SHA224_IV[6] | 0;
        this.H = _md_ts_1.SHA224_IV[7] | 0;
      }
    };
    exports2.SHA224 = SHA2242;
    var K512 = /* @__PURE__ */ (() => u64.split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n))))();
    var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
    var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
    var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
    var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
    var SHA512 = class extends _md_ts_1.HashMD {
      constructor(outputLen = 64) {
        super(128, outputLen, 16, false);
        this.Ah = _md_ts_1.SHA512_IV[0] | 0;
        this.Al = _md_ts_1.SHA512_IV[1] | 0;
        this.Bh = _md_ts_1.SHA512_IV[2] | 0;
        this.Bl = _md_ts_1.SHA512_IV[3] | 0;
        this.Ch = _md_ts_1.SHA512_IV[4] | 0;
        this.Cl = _md_ts_1.SHA512_IV[5] | 0;
        this.Dh = _md_ts_1.SHA512_IV[6] | 0;
        this.Dl = _md_ts_1.SHA512_IV[7] | 0;
        this.Eh = _md_ts_1.SHA512_IV[8] | 0;
        this.El = _md_ts_1.SHA512_IV[9] | 0;
        this.Fh = _md_ts_1.SHA512_IV[10] | 0;
        this.Fl = _md_ts_1.SHA512_IV[11] | 0;
        this.Gh = _md_ts_1.SHA512_IV[12] | 0;
        this.Gl = _md_ts_1.SHA512_IV[13] | 0;
        this.Hh = _md_ts_1.SHA512_IV[14] | 0;
        this.Hl = _md_ts_1.SHA512_IV[15] | 0;
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H[i] = view.getUint32(offset);
          SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H[i - 15] | 0;
          const W15l = SHA512_W_L[i - 15] | 0;
          const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
          const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H[i - 2] | 0;
          const W2l = SHA512_W_L[i - 2] | 0;
          const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
          const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
          const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
          const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
          SHA512_W_H[i] = SUMh | 0;
          SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
          const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
          const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
          const T1l = T1ll | 0;
          const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
          const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = u64.add3L(T1l, sigma0l, MAJl);
          Ah = u64.add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        (0, utils_ts_1.clean)(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
        (0, utils_ts_1.clean)(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    exports2.SHA512 = SHA512;
    var SHA384 = class extends SHA512 {
      constructor() {
        super(48);
        this.Ah = _md_ts_1.SHA384_IV[0] | 0;
        this.Al = _md_ts_1.SHA384_IV[1] | 0;
        this.Bh = _md_ts_1.SHA384_IV[2] | 0;
        this.Bl = _md_ts_1.SHA384_IV[3] | 0;
        this.Ch = _md_ts_1.SHA384_IV[4] | 0;
        this.Cl = _md_ts_1.SHA384_IV[5] | 0;
        this.Dh = _md_ts_1.SHA384_IV[6] | 0;
        this.Dl = _md_ts_1.SHA384_IV[7] | 0;
        this.Eh = _md_ts_1.SHA384_IV[8] | 0;
        this.El = _md_ts_1.SHA384_IV[9] | 0;
        this.Fh = _md_ts_1.SHA384_IV[10] | 0;
        this.Fl = _md_ts_1.SHA384_IV[11] | 0;
        this.Gh = _md_ts_1.SHA384_IV[12] | 0;
        this.Gl = _md_ts_1.SHA384_IV[13] | 0;
        this.Hh = _md_ts_1.SHA384_IV[14] | 0;
        this.Hl = _md_ts_1.SHA384_IV[15] | 0;
      }
    };
    exports2.SHA384 = SHA384;
    var T224_IV = /* @__PURE__ */ Uint32Array.from([
      2352822216,
      424955298,
      1944164710,
      2312950998,
      502970286,
      855612546,
      1738396948,
      1479516111,
      258812777,
      2077511080,
      2011393907,
      79989058,
      1067287976,
      1780299464,
      286451373,
      2446758561
    ]);
    var T256_IV = /* @__PURE__ */ Uint32Array.from([
      573645204,
      4230739756,
      2673172387,
      3360449730,
      596883563,
      1867755857,
      2520282905,
      1497426621,
      2519219938,
      2827943907,
      3193839141,
      1401305490,
      721525244,
      746961066,
      246885852,
      2177182882
    ]);
    var SHA512_224 = class extends SHA512 {
      constructor() {
        super(28);
        this.Ah = T224_IV[0] | 0;
        this.Al = T224_IV[1] | 0;
        this.Bh = T224_IV[2] | 0;
        this.Bl = T224_IV[3] | 0;
        this.Ch = T224_IV[4] | 0;
        this.Cl = T224_IV[5] | 0;
        this.Dh = T224_IV[6] | 0;
        this.Dl = T224_IV[7] | 0;
        this.Eh = T224_IV[8] | 0;
        this.El = T224_IV[9] | 0;
        this.Fh = T224_IV[10] | 0;
        this.Fl = T224_IV[11] | 0;
        this.Gh = T224_IV[12] | 0;
        this.Gl = T224_IV[13] | 0;
        this.Hh = T224_IV[14] | 0;
        this.Hl = T224_IV[15] | 0;
      }
    };
    exports2.SHA512_224 = SHA512_224;
    var SHA512_256 = class extends SHA512 {
      constructor() {
        super(32);
        this.Ah = T256_IV[0] | 0;
        this.Al = T256_IV[1] | 0;
        this.Bh = T256_IV[2] | 0;
        this.Bl = T256_IV[3] | 0;
        this.Ch = T256_IV[4] | 0;
        this.Cl = T256_IV[5] | 0;
        this.Dh = T256_IV[6] | 0;
        this.Dl = T256_IV[7] | 0;
        this.Eh = T256_IV[8] | 0;
        this.El = T256_IV[9] | 0;
        this.Fh = T256_IV[10] | 0;
        this.Fl = T256_IV[11] | 0;
        this.Gh = T256_IV[12] | 0;
        this.Gl = T256_IV[13] | 0;
        this.Hh = T256_IV[14] | 0;
        this.Hl = T256_IV[15] | 0;
      }
    };
    exports2.SHA512_256 = SHA512_256;
    exports2.sha256 = (0, utils_ts_1.createHasher)(() => new SHA2562());
    exports2.sha224 = (0, utils_ts_1.createHasher)(() => new SHA2242());
    exports2.sha512 = (0, utils_ts_1.createHasher)(() => new SHA512());
    exports2.sha384 = (0, utils_ts_1.createHasher)(() => new SHA384());
    exports2.sha512_256 = (0, utils_ts_1.createHasher)(() => new SHA512_256());
    exports2.sha512_224 = (0, utils_ts_1.createHasher)(() => new SHA512_224());
  }
});

// node_modules/@noble/hashes/sha256.js
var require_sha256 = __commonJS({
  "node_modules/@noble/hashes/sha256.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sha224 = exports2.SHA224 = exports2.sha256 = exports2.SHA256 = void 0;
    var sha2_ts_1 = require_sha2();
    exports2.SHA256 = sha2_ts_1.SHA256;
    exports2.sha256 = sha2_ts_1.sha256;
    exports2.SHA224 = sha2_ts_1.SHA224;
    exports2.sha224 = sha2_ts_1.sha224;
  }
});

// node_modules/bitcoinjs-lib/src/crypto.js
var require_crypto = __commonJS({
  "node_modules/bitcoinjs-lib/src/crypto.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.taggedHash = exports2.TAGGED_HASH_PREFIXES = exports2.TAGS = exports2.hash256 = exports2.hash160 = exports2.sha256 = exports2.sha1 = exports2.ripemd160 = void 0;
    var ripemd160_1 = require_ripemd160();
    var sha1_1 = require_sha1();
    var sha256_1 = require_sha256();
    function ripemd160(buffer) {
      return Buffer.from((0, ripemd160_1.ripemd160)(Uint8Array.from(buffer)));
    }
    exports2.ripemd160 = ripemd160;
    function sha1(buffer) {
      return Buffer.from((0, sha1_1.sha1)(Uint8Array.from(buffer)));
    }
    exports2.sha1 = sha1;
    function sha2563(buffer) {
      return Buffer.from((0, sha256_1.sha256)(Uint8Array.from(buffer)));
    }
    exports2.sha256 = sha2563;
    function hash160(buffer) {
      return Buffer.from(
        (0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(Uint8Array.from(buffer)))
      );
    }
    exports2.hash160 = hash160;
    function hash256(buffer) {
      return Buffer.from(
        (0, sha256_1.sha256)((0, sha256_1.sha256)(Uint8Array.from(buffer)))
      );
    }
    exports2.hash256 = hash256;
    exports2.TAGS = [
      "BIP0340/challenge",
      "BIP0340/aux",
      "BIP0340/nonce",
      "TapLeaf",
      "TapBranch",
      "TapSighash",
      "TapTweak",
      "KeyAgg list",
      "KeyAgg coefficient"
    ];
    exports2.TAGGED_HASH_PREFIXES = {
      "BIP0340/challenge": Buffer.from([
        123,
        181,
        45,
        122,
        159,
        239,
        88,
        50,
        62,
        177,
        191,
        122,
        64,
        125,
        179,
        130,
        210,
        243,
        242,
        216,
        27,
        177,
        34,
        79,
        73,
        254,
        81,
        143,
        109,
        72,
        211,
        124,
        123,
        181,
        45,
        122,
        159,
        239,
        88,
        50,
        62,
        177,
        191,
        122,
        64,
        125,
        179,
        130,
        210,
        243,
        242,
        216,
        27,
        177,
        34,
        79,
        73,
        254,
        81,
        143,
        109,
        72,
        211,
        124
      ]),
      "BIP0340/aux": Buffer.from([
        241,
        239,
        78,
        94,
        192,
        99,
        202,
        218,
        109,
        148,
        202,
        250,
        157,
        152,
        126,
        160,
        105,
        38,
        88,
        57,
        236,
        193,
        31,
        151,
        45,
        119,
        165,
        46,
        216,
        193,
        204,
        144,
        241,
        239,
        78,
        94,
        192,
        99,
        202,
        218,
        109,
        148,
        202,
        250,
        157,
        152,
        126,
        160,
        105,
        38,
        88,
        57,
        236,
        193,
        31,
        151,
        45,
        119,
        165,
        46,
        216,
        193,
        204,
        144
      ]),
      "BIP0340/nonce": Buffer.from([
        7,
        73,
        119,
        52,
        167,
        155,
        203,
        53,
        91,
        155,
        140,
        125,
        3,
        79,
        18,
        28,
        244,
        52,
        215,
        62,
        247,
        45,
        218,
        25,
        135,
        0,
        97,
        251,
        82,
        191,
        235,
        47,
        7,
        73,
        119,
        52,
        167,
        155,
        203,
        53,
        91,
        155,
        140,
        125,
        3,
        79,
        18,
        28,
        244,
        52,
        215,
        62,
        247,
        45,
        218,
        25,
        135,
        0,
        97,
        251,
        82,
        191,
        235,
        47
      ]),
      TapLeaf: Buffer.from([
        174,
        234,
        143,
        220,
        66,
        8,
        152,
        49,
        5,
        115,
        75,
        88,
        8,
        29,
        30,
        38,
        56,
        211,
        95,
        28,
        181,
        64,
        8,
        212,
        211,
        87,
        202,
        3,
        190,
        120,
        233,
        238,
        174,
        234,
        143,
        220,
        66,
        8,
        152,
        49,
        5,
        115,
        75,
        88,
        8,
        29,
        30,
        38,
        56,
        211,
        95,
        28,
        181,
        64,
        8,
        212,
        211,
        87,
        202,
        3,
        190,
        120,
        233,
        238
      ]),
      TapBranch: Buffer.from([
        25,
        65,
        161,
        242,
        229,
        110,
        185,
        95,
        162,
        169,
        241,
        148,
        190,
        92,
        1,
        247,
        33,
        111,
        51,
        237,
        130,
        176,
        145,
        70,
        52,
        144,
        208,
        91,
        245,
        22,
        160,
        21,
        25,
        65,
        161,
        242,
        229,
        110,
        185,
        95,
        162,
        169,
        241,
        148,
        190,
        92,
        1,
        247,
        33,
        111,
        51,
        237,
        130,
        176,
        145,
        70,
        52,
        144,
        208,
        91,
        245,
        22,
        160,
        21
      ]),
      TapSighash: Buffer.from([
        244,
        10,
        72,
        223,
        75,
        42,
        112,
        200,
        180,
        146,
        75,
        242,
        101,
        70,
        97,
        237,
        61,
        149,
        253,
        102,
        163,
        19,
        235,
        135,
        35,
        117,
        151,
        198,
        40,
        228,
        160,
        49,
        244,
        10,
        72,
        223,
        75,
        42,
        112,
        200,
        180,
        146,
        75,
        242,
        101,
        70,
        97,
        237,
        61,
        149,
        253,
        102,
        163,
        19,
        235,
        135,
        35,
        117,
        151,
        198,
        40,
        228,
        160,
        49
      ]),
      TapTweak: Buffer.from([
        232,
        15,
        225,
        99,
        156,
        156,
        160,
        80,
        227,
        175,
        27,
        57,
        193,
        67,
        198,
        62,
        66,
        156,
        188,
        235,
        21,
        217,
        64,
        251,
        181,
        197,
        161,
        244,
        175,
        87,
        197,
        233,
        232,
        15,
        225,
        99,
        156,
        156,
        160,
        80,
        227,
        175,
        27,
        57,
        193,
        67,
        198,
        62,
        66,
        156,
        188,
        235,
        21,
        217,
        64,
        251,
        181,
        197,
        161,
        244,
        175,
        87,
        197,
        233
      ]),
      "KeyAgg list": Buffer.from([
        72,
        28,
        151,
        28,
        60,
        11,
        70,
        215,
        240,
        178,
        117,
        174,
        89,
        141,
        78,
        44,
        126,
        215,
        49,
        156,
        89,
        74,
        92,
        110,
        199,
        158,
        160,
        212,
        153,
        2,
        148,
        240,
        72,
        28,
        151,
        28,
        60,
        11,
        70,
        215,
        240,
        178,
        117,
        174,
        89,
        141,
        78,
        44,
        126,
        215,
        49,
        156,
        89,
        74,
        92,
        110,
        199,
        158,
        160,
        212,
        153,
        2,
        148,
        240
      ]),
      "KeyAgg coefficient": Buffer.from([
        191,
        201,
        4,
        3,
        77,
        28,
        136,
        232,
        200,
        14,
        34,
        229,
        61,
        36,
        86,
        109,
        100,
        130,
        78,
        214,
        66,
        114,
        129,
        192,
        145,
        0,
        249,
        77,
        205,
        82,
        201,
        129,
        191,
        201,
        4,
        3,
        77,
        28,
        136,
        232,
        200,
        14,
        34,
        229,
        61,
        36,
        86,
        109,
        100,
        130,
        78,
        214,
        66,
        114,
        129,
        192,
        145,
        0,
        249,
        77,
        205,
        82,
        201,
        129
      ])
    };
    function taggedHash(prefix, data) {
      return sha2563(Buffer.concat([exports2.TAGGED_HASH_PREFIXES[prefix], data]));
    }
    exports2.taggedHash = taggedHash;
  }
});

// node_modules/bitcoinjs-lib/node_modules/base-x/src/index.js
var require_src = __commonJS({
  "node_modules/bitcoinjs-lib/node_modules/base-x/src/index.js"(exports2, module2) {
    "use strict";
    function base2(ALPHABET2) {
      if (ALPHABET2.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET2.length; i++) {
        var x = ALPHABET2.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE = ALPHABET2.length;
      var LEADER = ALPHABET2.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode2(source) {
        if (source instanceof Uint8Array) {
        } else if (ArrayBuffer.isView(source)) {
          source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
          source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
          throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length2 = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length2) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length2 = i2;
          pbegin++;
        }
        var it2 = size - length2;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET2.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return new Uint8Array();
        }
        var psz = 0;
        var zeroes = 0;
        var length2 = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (source[psz]) {
          var charCode = source.charCodeAt(psz);
          if (charCode > 255) {
            return;
          }
          var carry = BASE_MAP[charCode];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length2) && it3 !== -1; it3--, i2++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length2 = i2;
          psz++;
        }
        var it4 = size - length2;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode2(string2) {
        var buffer = decodeUnsafe(string2);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode: encode2,
        decodeUnsafe,
        decode: decode2
      };
    }
    module2.exports = base2;
  }
});

// node_modules/bitcoinjs-lib/node_modules/bs58/index.js
var require_bs58 = __commonJS({
  "node_modules/bitcoinjs-lib/node_modules/bs58/index.js"(exports2, module2) {
    var basex = require_src();
    var ALPHABET2 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module2.exports = basex(ALPHABET2);
  }
});

// node_modules/bitcoinjs-lib/node_modules/bs58check/base.js
var require_base = __commonJS({
  "node_modules/bitcoinjs-lib/node_modules/bs58check/base.js"(exports2, module2) {
    "use strict";
    var base58 = require_bs58();
    module2.exports = function(checksumFn) {
      function encode2(payload) {
        var payloadU8 = Uint8Array.from(payload);
        var checksum = checksumFn(payloadU8);
        var length2 = payloadU8.length + 4;
        var both = new Uint8Array(length2);
        both.set(payloadU8, 0);
        both.set(checksum.subarray(0, 4), payloadU8.length);
        return base58.encode(both, length2);
      }
      function decodeRaw2(buffer) {
        var payload = buffer.slice(0, -4);
        var checksum = buffer.slice(-4);
        var newChecksum = checksumFn(payload);
        if (checksum[0] ^ newChecksum[0] | checksum[1] ^ newChecksum[1] | checksum[2] ^ newChecksum[2] | checksum[3] ^ newChecksum[3]) return;
        return payload;
      }
      function decodeUnsafe(string2) {
        var buffer = base58.decodeUnsafe(string2);
        if (!buffer) return;
        return decodeRaw2(buffer);
      }
      function decode2(string2) {
        var buffer = base58.decode(string2);
        var payload = decodeRaw2(buffer, checksumFn);
        if (!payload) throw new Error("Invalid checksum");
        return payload;
      }
      return {
        encode: encode2,
        decode: decode2,
        decodeUnsafe
      };
    };
  }
});

// node_modules/bitcoinjs-lib/node_modules/bs58check/index.js
var require_bs58check = __commonJS({
  "node_modules/bitcoinjs-lib/node_modules/bs58check/index.js"(exports2, module2) {
    "use strict";
    var { sha256: sha2563 } = require_sha256();
    var bs58checkBase = require_base();
    function sha256x22(buffer) {
      return sha2563(sha2563(buffer));
    }
    module2.exports = bs58checkBase(sha256x22);
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2pkh.js
var require_p2pkh = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2pkh.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2pkh = void 0;
    var bcrypto = require_crypto();
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var bs58check = require_bs58check();
    var OPS = bscript.OPS;
    function p2pkh(a, opts) {
      if (!a.address && !a.hash && !a.output && !a.pubkey && !a.input)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          address: types_1.typeforce.maybe(types_1.typeforce.String),
          hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
          output: types_1.typeforce.maybe(types_1.typeforce.BufferN(25)),
          pubkey: types_1.typeforce.maybe(types_1.isPoint),
          signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
          input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
        },
        a
      );
      const _address = lazy.value(() => {
        const payload = Buffer.from(bs58check.decode(a.address));
        const version = payload.readUInt8(0);
        const hash = payload.slice(1);
        return { version, hash };
      });
      const _chunks = lazy.value(() => {
        return bscript.decompile(a.input);
      });
      const network = a.network || networks_1.bitcoin;
      const o = { name: "p2pkh", network };
      lazy.prop(o, "address", () => {
        if (!o.hash) return;
        const payload = Buffer.allocUnsafe(21);
        payload.writeUInt8(network.pubKeyHash, 0);
        o.hash.copy(payload, 1);
        return bs58check.encode(payload);
      });
      lazy.prop(o, "hash", () => {
        if (a.output) return a.output.slice(3, 23);
        if (a.address) return _address().hash;
        if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
      });
      lazy.prop(o, "output", () => {
        if (!o.hash) return;
        return bscript.compile([
          OPS.OP_DUP,
          OPS.OP_HASH160,
          o.hash,
          OPS.OP_EQUALVERIFY,
          OPS.OP_CHECKSIG
        ]);
      });
      lazy.prop(o, "pubkey", () => {
        if (!a.input) return;
        return _chunks()[1];
      });
      lazy.prop(o, "signature", () => {
        if (!a.input) return;
        return _chunks()[0];
      });
      lazy.prop(o, "input", () => {
        if (!a.pubkey) return;
        if (!a.signature) return;
        return bscript.compile([a.signature, a.pubkey]);
      });
      lazy.prop(o, "witness", () => {
        if (!o.input) return;
        return [];
      });
      if (opts.validate) {
        let hash = Buffer.from([]);
        if (a.address) {
          if (_address().version !== network.pubKeyHash)
            throw new TypeError("Invalid version or Network mismatch");
          if (_address().hash.length !== 20) throw new TypeError("Invalid address");
          hash = _address().hash;
        }
        if (a.hash) {
          if (hash.length > 0 && !hash.equals(a.hash))
            throw new TypeError("Hash mismatch");
          else hash = a.hash;
        }
        if (a.output) {
          if (a.output.length !== 25 || a.output[0] !== OPS.OP_DUP || a.output[1] !== OPS.OP_HASH160 || a.output[2] !== 20 || a.output[23] !== OPS.OP_EQUALVERIFY || a.output[24] !== OPS.OP_CHECKSIG)
            throw new TypeError("Output is invalid");
          const hash2 = a.output.slice(3, 23);
          if (hash.length > 0 && !hash.equals(hash2))
            throw new TypeError("Hash mismatch");
          else hash = hash2;
        }
        if (a.pubkey) {
          const pkh = bcrypto.hash160(a.pubkey);
          if (hash.length > 0 && !hash.equals(pkh))
            throw new TypeError("Hash mismatch");
          else hash = pkh;
        }
        if (a.input) {
          const chunks = _chunks();
          if (chunks.length !== 2) throw new TypeError("Input is invalid");
          if (!bscript.isCanonicalScriptSignature(chunks[0]))
            throw new TypeError("Input has invalid signature");
          if (!(0, types_1.isPoint)(chunks[1]))
            throw new TypeError("Input has invalid pubkey");
          if (a.signature && !a.signature.equals(chunks[0]))
            throw new TypeError("Signature mismatch");
          if (a.pubkey && !a.pubkey.equals(chunks[1]))
            throw new TypeError("Pubkey mismatch");
          const pkh = bcrypto.hash160(chunks[1]);
          if (hash.length > 0 && !hash.equals(pkh))
            throw new TypeError("Hash mismatch");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2pkh = p2pkh;
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2sh.js
var require_p2sh = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2sh.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2sh = void 0;
    var bcrypto = require_crypto();
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var bs58check = require_bs58check();
    var OPS = bscript.OPS;
    function p2sh(a, opts) {
      if (!a.address && !a.hash && !a.output && !a.redeem && !a.input)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          address: types_1.typeforce.maybe(types_1.typeforce.String),
          hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
          output: types_1.typeforce.maybe(types_1.typeforce.BufferN(23)),
          redeem: types_1.typeforce.maybe({
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          }),
          input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
          witness: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
          )
        },
        a
      );
      let network = a.network;
      if (!network) {
        network = a.redeem && a.redeem.network || networks_1.bitcoin;
      }
      const o = { network };
      const _address = lazy.value(() => {
        const payload = Buffer.from(bs58check.decode(a.address));
        const version = payload.readUInt8(0);
        const hash = payload.slice(1);
        return { version, hash };
      });
      const _chunks = lazy.value(() => {
        return bscript.decompile(a.input);
      });
      const _redeem = lazy.value(() => {
        const chunks = _chunks();
        const lastChunk = chunks[chunks.length - 1];
        return {
          network,
          output: lastChunk === OPS.OP_FALSE ? Buffer.from([]) : lastChunk,
          input: bscript.compile(chunks.slice(0, -1)),
          witness: a.witness || []
        };
      });
      lazy.prop(o, "address", () => {
        if (!o.hash) return;
        const payload = Buffer.allocUnsafe(21);
        payload.writeUInt8(o.network.scriptHash, 0);
        o.hash.copy(payload, 1);
        return bs58check.encode(payload);
      });
      lazy.prop(o, "hash", () => {
        if (a.output) return a.output.slice(2, 22);
        if (a.address) return _address().hash;
        if (o.redeem && o.redeem.output) return bcrypto.hash160(o.redeem.output);
      });
      lazy.prop(o, "output", () => {
        if (!o.hash) return;
        return bscript.compile([OPS.OP_HASH160, o.hash, OPS.OP_EQUAL]);
      });
      lazy.prop(o, "redeem", () => {
        if (!a.input) return;
        return _redeem();
      });
      lazy.prop(o, "input", () => {
        if (!a.redeem || !a.redeem.input || !a.redeem.output) return;
        return bscript.compile(
          [].concat(bscript.decompile(a.redeem.input), a.redeem.output)
        );
      });
      lazy.prop(o, "witness", () => {
        if (o.redeem && o.redeem.witness) return o.redeem.witness;
        if (o.input) return [];
      });
      lazy.prop(o, "name", () => {
        const nameParts = ["p2sh"];
        if (o.redeem !== void 0 && o.redeem.name !== void 0)
          nameParts.push(o.redeem.name);
        return nameParts.join("-");
      });
      if (opts.validate) {
        let hash = Buffer.from([]);
        if (a.address) {
          if (_address().version !== network.scriptHash)
            throw new TypeError("Invalid version or Network mismatch");
          if (_address().hash.length !== 20) throw new TypeError("Invalid address");
          hash = _address().hash;
        }
        if (a.hash) {
          if (hash.length > 0 && !hash.equals(a.hash))
            throw new TypeError("Hash mismatch");
          else hash = a.hash;
        }
        if (a.output) {
          if (a.output.length !== 23 || a.output[0] !== OPS.OP_HASH160 || a.output[1] !== 20 || a.output[22] !== OPS.OP_EQUAL)
            throw new TypeError("Output is invalid");
          const hash2 = a.output.slice(2, 22);
          if (hash.length > 0 && !hash.equals(hash2))
            throw new TypeError("Hash mismatch");
          else hash = hash2;
        }
        const checkRedeem = (redeem) => {
          if (redeem.output) {
            const decompile = bscript.decompile(redeem.output);
            if (!decompile || decompile.length < 1)
              throw new TypeError("Redeem.output too short");
            if (redeem.output.byteLength > 520)
              throw new TypeError(
                "Redeem.output unspendable if larger than 520 bytes"
              );
            if (bscript.countNonPushOnlyOPs(decompile) > 201)
              throw new TypeError(
                "Redeem.output unspendable with more than 201 non-push ops"
              );
            const hash2 = bcrypto.hash160(redeem.output);
            if (hash.length > 0 && !hash.equals(hash2))
              throw new TypeError("Hash mismatch");
            else hash = hash2;
          }
          if (redeem.input) {
            const hasInput = redeem.input.length > 0;
            const hasWitness = redeem.witness && redeem.witness.length > 0;
            if (!hasInput && !hasWitness) throw new TypeError("Empty input");
            if (hasInput && hasWitness)
              throw new TypeError("Input and witness provided");
            if (hasInput) {
              const richunks = bscript.decompile(redeem.input);
              if (!bscript.isPushOnly(richunks))
                throw new TypeError("Non push-only scriptSig");
            }
          }
        };
        if (a.input) {
          const chunks = _chunks();
          if (!chunks || chunks.length < 1) throw new TypeError("Input too short");
          if (!Buffer.isBuffer(_redeem().output))
            throw new TypeError("Input is invalid");
          checkRedeem(_redeem());
        }
        if (a.redeem) {
          if (a.redeem.network && a.redeem.network !== network)
            throw new TypeError("Network mismatch");
          if (a.input) {
            const redeem = _redeem();
            if (a.redeem.output && !a.redeem.output.equals(redeem.output))
              throw new TypeError("Redeem.output mismatch");
            if (a.redeem.input && !a.redeem.input.equals(redeem.input))
              throw new TypeError("Redeem.input mismatch");
          }
          checkRedeem(a.redeem);
        }
        if (a.witness) {
          if (a.redeem && a.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, a.witness))
            throw new TypeError("Witness and redeem.witness mismatch");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2sh = p2sh;
  }
});

// node_modules/bech32/dist/index.js
var require_dist = __commonJS({
  "node_modules/bech32/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.bech32m = exports2.bech32 = void 0;
    var ALPHABET2 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    var ALPHABET_MAP = {};
    for (let z = 0; z < ALPHABET2.length; z++) {
      const x = ALPHABET2.charAt(z);
      ALPHABET_MAP[x] = z;
    }
    function polymodStep(pre) {
      const b = pre >> 25;
      return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
    }
    function prefixChk(prefix) {
      let chk = 1;
      for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126)
          return "Invalid prefix (" + prefix + ")";
        chk = polymodStep(chk) ^ c >> 5;
      }
      chk = polymodStep(chk);
      for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ v & 31;
      }
      return chk;
    }
    function convert(data, inBits, outBits, pad) {
      let value = 0;
      let bits = 0;
      const maxV = (1 << outBits) - 1;
      const result = [];
      for (let i = 0; i < data.length; ++i) {
        value = value << inBits | data[i];
        bits += inBits;
        while (bits >= outBits) {
          bits -= outBits;
          result.push(value >> bits & maxV);
        }
      }
      if (pad) {
        if (bits > 0) {
          result.push(value << outBits - bits & maxV);
        }
      } else {
        if (bits >= inBits)
          return "Excess padding";
        if (value << outBits - bits & maxV)
          return "Non-zero padding";
      }
      return result;
    }
    function toWords(bytes) {
      return convert(bytes, 8, 5, true);
    }
    function fromWordsUnsafe(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
    }
    function fromWords(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
      throw new Error(res);
    }
    function getLibraryFromEncoding(encoding) {
      let ENCODING_CONST;
      if (encoding === "bech32") {
        ENCODING_CONST = 1;
      } else {
        ENCODING_CONST = 734539939;
      }
      function encode2(prefix, words, LIMIT) {
        LIMIT = LIMIT || 90;
        if (prefix.length + 7 + words.length > LIMIT)
          throw new TypeError("Exceeds length limit");
        prefix = prefix.toLowerCase();
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          throw new Error(chk);
        let result = prefix + "1";
        for (let i = 0; i < words.length; ++i) {
          const x = words[i];
          if (x >> 5 !== 0)
            throw new Error("Non 5-bit word");
          chk = polymodStep(chk) ^ x;
          result += ALPHABET2.charAt(x);
        }
        for (let i = 0; i < 6; ++i) {
          chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;
        for (let i = 0; i < 6; ++i) {
          const v = chk >> (5 - i) * 5 & 31;
          result += ALPHABET2.charAt(v);
        }
        return result;
      }
      function __decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        if (str.length < 8)
          return str + " too short";
        if (str.length > LIMIT)
          return "Exceeds length limit";
        const lowered = str.toLowerCase();
        const uppered = str.toUpperCase();
        if (str !== lowered && str !== uppered)
          return "Mixed-case string " + str;
        str = lowered;
        const split2 = str.lastIndexOf("1");
        if (split2 === -1)
          return "No separator character for " + str;
        if (split2 === 0)
          return "Missing prefix for " + str;
        const prefix = str.slice(0, split2);
        const wordChars = str.slice(split2 + 1);
        if (wordChars.length < 6)
          return "Data too short";
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          return chk;
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
          const c = wordChars.charAt(i);
          const v = ALPHABET_MAP[c];
          if (v === void 0)
            return "Unknown character " + c;
          chk = polymodStep(chk) ^ v;
          if (i + 6 >= wordChars.length)
            continue;
          words.push(v);
        }
        if (chk !== ENCODING_CONST)
          return "Invalid checksum for " + str;
        return { prefix, words };
      }
      function decodeUnsafe(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
      }
      function decode2(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
        throw new Error(res);
      }
      return {
        decodeUnsafe,
        decode: decode2,
        encode: encode2,
        toWords,
        fromWordsUnsafe,
        fromWords
      };
    }
    exports2.bech32 = getLibraryFromEncoding("bech32");
    exports2.bech32m = getLibraryFromEncoding("bech32m");
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2wpkh.js
var require_p2wpkh = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2wpkh.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2wpkh = void 0;
    var bcrypto = require_crypto();
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var bech32_1 = require_dist();
    var OPS = bscript.OPS;
    var EMPTY_BUFFER = Buffer.alloc(0);
    function p2wpkh(a, opts) {
      if (!a.address && !a.hash && !a.output && !a.pubkey && !a.witness)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          address: types_1.typeforce.maybe(types_1.typeforce.String),
          hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
          input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          output: types_1.typeforce.maybe(types_1.typeforce.BufferN(22)),
          pubkey: types_1.typeforce.maybe(types_1.isPoint),
          signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
          witness: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
          )
        },
        a
      );
      const _address = lazy.value(() => {
        const result = bech32_1.bech32.decode(a.address);
        const version = result.words.shift();
        const data = bech32_1.bech32.fromWords(result.words);
        return {
          version,
          prefix: result.prefix,
          data: Buffer.from(data)
        };
      });
      const network = a.network || networks_1.bitcoin;
      const o = { name: "p2wpkh", network };
      lazy.prop(o, "address", () => {
        if (!o.hash) return;
        const words = bech32_1.bech32.toWords(o.hash);
        words.unshift(0);
        return bech32_1.bech32.encode(network.bech32, words);
      });
      lazy.prop(o, "hash", () => {
        if (a.output) return a.output.slice(2, 22);
        if (a.address) return _address().data;
        if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
      });
      lazy.prop(o, "output", () => {
        if (!o.hash) return;
        return bscript.compile([OPS.OP_0, o.hash]);
      });
      lazy.prop(o, "pubkey", () => {
        if (a.pubkey) return a.pubkey;
        if (!a.witness) return;
        return a.witness[1];
      });
      lazy.prop(o, "signature", () => {
        if (!a.witness) return;
        return a.witness[0];
      });
      lazy.prop(o, "input", () => {
        if (!o.witness) return;
        return EMPTY_BUFFER;
      });
      lazy.prop(o, "witness", () => {
        if (!a.pubkey) return;
        if (!a.signature) return;
        return [a.signature, a.pubkey];
      });
      if (opts.validate) {
        let hash = Buffer.from([]);
        if (a.address) {
          if (network && network.bech32 !== _address().prefix)
            throw new TypeError("Invalid prefix or Network mismatch");
          if (_address().version !== 0)
            throw new TypeError("Invalid address version");
          if (_address().data.length !== 20)
            throw new TypeError("Invalid address data");
          hash = _address().data;
        }
        if (a.hash) {
          if (hash.length > 0 && !hash.equals(a.hash))
            throw new TypeError("Hash mismatch");
          else hash = a.hash;
        }
        if (a.output) {
          if (a.output.length !== 22 || a.output[0] !== OPS.OP_0 || a.output[1] !== 20)
            throw new TypeError("Output is invalid");
          if (hash.length > 0 && !hash.equals(a.output.slice(2)))
            throw new TypeError("Hash mismatch");
          else hash = a.output.slice(2);
        }
        if (a.pubkey) {
          const pkh = bcrypto.hash160(a.pubkey);
          if (hash.length > 0 && !hash.equals(pkh))
            throw new TypeError("Hash mismatch");
          else hash = pkh;
          if (!(0, types_1.isPoint)(a.pubkey) || a.pubkey.length !== 33)
            throw new TypeError("Invalid pubkey for p2wpkh");
        }
        if (a.witness) {
          if (a.witness.length !== 2) throw new TypeError("Witness is invalid");
          if (!bscript.isCanonicalScriptSignature(a.witness[0]))
            throw new TypeError("Witness has invalid signature");
          if (!(0, types_1.isPoint)(a.witness[1]) || a.witness[1].length !== 33)
            throw new TypeError("Witness has invalid pubkey");
          if (a.signature && !a.signature.equals(a.witness[0]))
            throw new TypeError("Signature mismatch");
          if (a.pubkey && !a.pubkey.equals(a.witness[1]))
            throw new TypeError("Pubkey mismatch");
          const pkh = bcrypto.hash160(a.witness[1]);
          if (hash.length > 0 && !hash.equals(pkh))
            throw new TypeError("Hash mismatch");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2wpkh = p2wpkh;
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2wsh.js
var require_p2wsh = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2wsh.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2wsh = void 0;
    var bcrypto = require_crypto();
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var lazy = require_lazy();
    var bech32_1 = require_dist();
    var OPS = bscript.OPS;
    var EMPTY_BUFFER = Buffer.alloc(0);
    function chunkHasUncompressedPubkey(chunk) {
      if (Buffer.isBuffer(chunk) && chunk.length === 65 && chunk[0] === 4 && (0, types_1.isPoint)(chunk)) {
        return true;
      } else {
        return false;
      }
    }
    function p2wsh(a, opts) {
      if (!a.address && !a.hash && !a.output && !a.redeem && !a.witness)
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          address: types_1.typeforce.maybe(types_1.typeforce.String),
          hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
          output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
          redeem: types_1.typeforce.maybe({
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          }),
          input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
          witness: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
          )
        },
        a
      );
      const _address = lazy.value(() => {
        const result = bech32_1.bech32.decode(a.address);
        const version = result.words.shift();
        const data = bech32_1.bech32.fromWords(result.words);
        return {
          version,
          prefix: result.prefix,
          data: Buffer.from(data)
        };
      });
      const _rchunks = lazy.value(() => {
        return bscript.decompile(a.redeem.input);
      });
      let network = a.network;
      if (!network) {
        network = a.redeem && a.redeem.network || networks_1.bitcoin;
      }
      const o = { network };
      lazy.prop(o, "address", () => {
        if (!o.hash) return;
        const words = bech32_1.bech32.toWords(o.hash);
        words.unshift(0);
        return bech32_1.bech32.encode(network.bech32, words);
      });
      lazy.prop(o, "hash", () => {
        if (a.output) return a.output.slice(2);
        if (a.address) return _address().data;
        if (o.redeem && o.redeem.output) return bcrypto.sha256(o.redeem.output);
      });
      lazy.prop(o, "output", () => {
        if (!o.hash) return;
        return bscript.compile([OPS.OP_0, o.hash]);
      });
      lazy.prop(o, "redeem", () => {
        if (!a.witness) return;
        return {
          output: a.witness[a.witness.length - 1],
          input: EMPTY_BUFFER,
          witness: a.witness.slice(0, -1)
        };
      });
      lazy.prop(o, "input", () => {
        if (!o.witness) return;
        return EMPTY_BUFFER;
      });
      lazy.prop(o, "witness", () => {
        if (a.redeem && a.redeem.input && a.redeem.input.length > 0 && a.redeem.output && a.redeem.output.length > 0) {
          const stack = bscript.toStack(_rchunks());
          o.redeem = Object.assign({ witness: stack }, a.redeem);
          o.redeem.input = EMPTY_BUFFER;
          return [].concat(stack, a.redeem.output);
        }
        if (!a.redeem) return;
        if (!a.redeem.output) return;
        if (!a.redeem.witness) return;
        return [].concat(a.redeem.witness, a.redeem.output);
      });
      lazy.prop(o, "name", () => {
        const nameParts = ["p2wsh"];
        if (o.redeem !== void 0 && o.redeem.name !== void 0)
          nameParts.push(o.redeem.name);
        return nameParts.join("-");
      });
      if (opts.validate) {
        let hash = Buffer.from([]);
        if (a.address) {
          if (_address().prefix !== network.bech32)
            throw new TypeError("Invalid prefix or Network mismatch");
          if (_address().version !== 0)
            throw new TypeError("Invalid address version");
          if (_address().data.length !== 32)
            throw new TypeError("Invalid address data");
          hash = _address().data;
        }
        if (a.hash) {
          if (hash.length > 0 && !hash.equals(a.hash))
            throw new TypeError("Hash mismatch");
          else hash = a.hash;
        }
        if (a.output) {
          if (a.output.length !== 34 || a.output[0] !== OPS.OP_0 || a.output[1] !== 32)
            throw new TypeError("Output is invalid");
          const hash2 = a.output.slice(2);
          if (hash.length > 0 && !hash.equals(hash2))
            throw new TypeError("Hash mismatch");
          else hash = hash2;
        }
        if (a.redeem) {
          if (a.redeem.network && a.redeem.network !== network)
            throw new TypeError("Network mismatch");
          if (a.redeem.input && a.redeem.input.length > 0 && a.redeem.witness && a.redeem.witness.length > 0)
            throw new TypeError("Ambiguous witness source");
          if (a.redeem.output) {
            const decompile = bscript.decompile(a.redeem.output);
            if (!decompile || decompile.length < 1)
              throw new TypeError("Redeem.output is invalid");
            if (a.redeem.output.byteLength > 3600)
              throw new TypeError(
                "Redeem.output unspendable if larger than 3600 bytes"
              );
            if (bscript.countNonPushOnlyOPs(decompile) > 201)
              throw new TypeError(
                "Redeem.output unspendable with more than 201 non-push ops"
              );
            const hash2 = bcrypto.sha256(a.redeem.output);
            if (hash.length > 0 && !hash.equals(hash2))
              throw new TypeError("Hash mismatch");
            else hash = hash2;
          }
          if (a.redeem.input && !bscript.isPushOnly(_rchunks()))
            throw new TypeError("Non push-only scriptSig");
          if (a.witness && a.redeem.witness && !(0, types_1.stacksEqual)(a.witness, a.redeem.witness))
            throw new TypeError("Witness and redeem.witness mismatch");
          if (a.redeem.input && _rchunks().some(chunkHasUncompressedPubkey) || a.redeem.output && (bscript.decompile(a.redeem.output) || []).some(
            chunkHasUncompressedPubkey
          )) {
            throw new TypeError(
              "redeem.input or redeem.output contains uncompressed pubkey"
            );
          }
        }
        if (a.witness && a.witness.length > 0) {
          const wScript = a.witness[a.witness.length - 1];
          if (a.redeem && a.redeem.output && !a.redeem.output.equals(wScript))
            throw new TypeError("Witness and redeem.output mismatch");
          if (a.witness.some(chunkHasUncompressedPubkey) || (bscript.decompile(wScript) || []).some(chunkHasUncompressedPubkey))
            throw new TypeError("Witness contains uncompressed pubkey");
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2wsh = p2wsh;
  }
});

// node_modules/bitcoinjs-lib/src/ecc_lib.js
var require_ecc_lib = __commonJS({
  "node_modules/bitcoinjs-lib/src/ecc_lib.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getEccLib = exports2.initEccLib = void 0;
    var _ECCLIB_CACHE = {};
    function initEccLib(eccLib, opts) {
      if (!eccLib) {
        _ECCLIB_CACHE.eccLib = eccLib;
      } else if (eccLib !== _ECCLIB_CACHE.eccLib) {
        if (!opts?.DANGER_DO_NOT_VERIFY_ECCLIB)
          verifyEcc(eccLib);
        _ECCLIB_CACHE.eccLib = eccLib;
      }
    }
    exports2.initEccLib = initEccLib;
    function getEccLib() {
      if (!_ECCLIB_CACHE.eccLib)
        throw new Error(
          "No ECC Library provided. You must call initEccLib() with a valid TinySecp256k1Interface instance"
        );
      return _ECCLIB_CACHE.eccLib;
    }
    exports2.getEccLib = getEccLib;
    var h2 = (hex) => Buffer.from(hex, "hex");
    function verifyEcc(ecc2) {
      assert2(typeof ecc2.isXOnlyPoint === "function");
      assert2(
        ecc2.isXOnlyPoint(
          h2("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
        )
      );
      assert2(
        ecc2.isXOnlyPoint(
          h2("fffffffffffffffffffffffffffffffffffffffffffffffffffffffeeffffc2e")
        )
      );
      assert2(
        ecc2.isXOnlyPoint(
          h2("f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9")
        )
      );
      assert2(
        ecc2.isXOnlyPoint(
          h2("0000000000000000000000000000000000000000000000000000000000000001")
        )
      );
      assert2(
        !ecc2.isXOnlyPoint(
          h2("0000000000000000000000000000000000000000000000000000000000000000")
        )
      );
      assert2(
        !ecc2.isXOnlyPoint(
          h2("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f")
        )
      );
      assert2(typeof ecc2.xOnlyPointAddTweak === "function");
      tweakAddVectors.forEach((t) => {
        const r = ecc2.xOnlyPointAddTweak(h2(t.pubkey), h2(t.tweak));
        if (t.result === null) {
          assert2(r === null);
        } else {
          assert2(r !== null);
          assert2(r.parity === t.parity);
          assert2(Buffer.from(r.xOnlyPubkey).equals(h2(t.result)));
        }
      });
    }
    function assert2(bool) {
      if (!bool) throw new Error("ecc library invalid");
    }
    var tweakAddVectors = [
      {
        pubkey: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        tweak: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
        parity: -1,
        result: null
      },
      {
        pubkey: "1617d38ed8d8657da4d4761e8057bc396ea9e4b9d29776d4be096016dbd2509b",
        tweak: "a8397a935f0dfceba6ba9618f6451ef4d80637abf4e6af2669fbc9de6a8fd2ac",
        parity: 1,
        result: "e478f99dab91052ab39a33ea35fd5e6e4933f4d28023cd597c9a1f6760346adf"
      },
      {
        pubkey: "2c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991",
        tweak: "823c3cd2142744b075a87eade7e1b8678ba308d566226a0056ca2b7a76f86b47",
        parity: 0,
        result: "9534f8dc8c6deda2dc007655981c78b49c5d96c778fbf363462a11ec9dfd948c"
      }
    ];
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length2) {
      return Buffer2(arg, encodingOrOffset, length2);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length2) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length2);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/varuint-bitcoin/index.js
var require_varuint_bitcoin = __commonJS({
  "node_modules/varuint-bitcoin/index.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var MAX_SAFE_INTEGER = 9007199254740991;
    function checkUInt53(n) {
      if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError("value out of range");
    }
    function encode2(number2, buffer, offset) {
      checkUInt53(number2);
      if (!buffer) buffer = Buffer2.allocUnsafe(encodingLength(number2));
      if (!Buffer2.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
      if (!offset) offset = 0;
      if (number2 < 253) {
        buffer.writeUInt8(number2, offset);
        encode2.bytes = 1;
      } else if (number2 <= 65535) {
        buffer.writeUInt8(253, offset);
        buffer.writeUInt16LE(number2, offset + 1);
        encode2.bytes = 3;
      } else if (number2 <= 4294967295) {
        buffer.writeUInt8(254, offset);
        buffer.writeUInt32LE(number2, offset + 1);
        encode2.bytes = 5;
      } else {
        buffer.writeUInt8(255, offset);
        buffer.writeUInt32LE(number2 >>> 0, offset + 1);
        buffer.writeUInt32LE(number2 / 4294967296 | 0, offset + 5);
        encode2.bytes = 9;
      }
      return buffer;
    }
    function decode2(buffer, offset) {
      if (!Buffer2.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
      if (!offset) offset = 0;
      var first = buffer.readUInt8(offset);
      if (first < 253) {
        decode2.bytes = 1;
        return first;
      } else if (first === 253) {
        decode2.bytes = 3;
        return buffer.readUInt16LE(offset + 1);
      } else if (first === 254) {
        decode2.bytes = 5;
        return buffer.readUInt32LE(offset + 1);
      } else {
        decode2.bytes = 9;
        var lo = buffer.readUInt32LE(offset + 1);
        var hi = buffer.readUInt32LE(offset + 5);
        var number2 = hi * 4294967296 + lo;
        checkUInt53(number2);
        return number2;
      }
    }
    function encodingLength(number2) {
      checkUInt53(number2);
      return number2 < 253 ? 1 : number2 <= 65535 ? 3 : number2 <= 4294967295 ? 5 : 9;
    }
    module2.exports = { encode: encode2, decode: decode2, encodingLength };
  }
});

// node_modules/bitcoinjs-lib/src/bufferutils.js
var require_bufferutils = __commonJS({
  "node_modules/bitcoinjs-lib/src/bufferutils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BufferReader = exports2.BufferWriter = exports2.cloneBuffer = exports2.reverseBuffer = exports2.writeUInt64LE = exports2.readUInt64LE = exports2.varuint = void 0;
    var types = require_types();
    var { typeforce } = types;
    var varuint = require_varuint_bitcoin();
    exports2.varuint = varuint;
    function verifuint(value, max) {
      if (typeof value !== "number")
        throw new Error("cannot write a non-number as a number");
      if (value < 0)
        throw new Error("specified a negative value for writing an unsigned value");
      if (value > max) throw new Error("RangeError: value out of range");
      if (Math.floor(value) !== value)
        throw new Error("value has a fractional component");
    }
    function readUInt64LE(buffer, offset) {
      const a = buffer.readUInt32LE(offset);
      let b = buffer.readUInt32LE(offset + 4);
      b *= 4294967296;
      verifuint(b + a, 9007199254740991);
      return b + a;
    }
    exports2.readUInt64LE = readUInt64LE;
    function writeUInt64LE(buffer, value, offset) {
      verifuint(value, 9007199254740991);
      buffer.writeInt32LE(value & -1, offset);
      buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
      return offset + 8;
    }
    exports2.writeUInt64LE = writeUInt64LE;
    function reverseBuffer(buffer) {
      if (buffer.length < 1) return buffer;
      let j = buffer.length - 1;
      let tmp = 0;
      for (let i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
      }
      return buffer;
    }
    exports2.reverseBuffer = reverseBuffer;
    function cloneBuffer(buffer) {
      const clone = Buffer.allocUnsafe(buffer.length);
      buffer.copy(clone);
      return clone;
    }
    exports2.cloneBuffer = cloneBuffer;
    var BufferWriter = class _BufferWriter {
      static withCapacity(size) {
        return new _BufferWriter(Buffer.alloc(size));
      }
      constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
      }
      writeUInt8(i) {
        this.offset = this.buffer.writeUInt8(i, this.offset);
      }
      writeInt32(i) {
        this.offset = this.buffer.writeInt32LE(i, this.offset);
      }
      writeUInt32(i) {
        this.offset = this.buffer.writeUInt32LE(i, this.offset);
      }
      writeUInt64(i) {
        this.offset = writeUInt64LE(this.buffer, i, this.offset);
      }
      writeVarInt(i) {
        varuint.encode(i, this.buffer, this.offset);
        this.offset += varuint.encode.bytes;
      }
      writeSlice(slice) {
        if (this.buffer.length < this.offset + slice.length) {
          throw new Error("Cannot write slice out of bounds");
        }
        this.offset += slice.copy(this.buffer, this.offset);
      }
      writeVarSlice(slice) {
        this.writeVarInt(slice.length);
        this.writeSlice(slice);
      }
      writeVector(vector) {
        this.writeVarInt(vector.length);
        vector.forEach((buf) => this.writeVarSlice(buf));
      }
      end() {
        if (this.buffer.length === this.offset) {
          return this.buffer;
        }
        throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
      }
    };
    exports2.BufferWriter = BufferWriter;
    var BufferReader = class {
      constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        typeforce(types.tuple(types.Buffer, types.UInt32), [buffer, offset]);
      }
      readUInt8() {
        const result = this.buffer.readUInt8(this.offset);
        this.offset++;
        return result;
      }
      readInt32() {
        const result = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return result;
      }
      readUInt32() {
        const result = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return result;
      }
      readUInt64() {
        const result = readUInt64LE(this.buffer, this.offset);
        this.offset += 8;
        return result;
      }
      readVarInt() {
        const vi = varuint.decode(this.buffer, this.offset);
        this.offset += varuint.decode.bytes;
        return vi;
      }
      readSlice(n) {
        if (this.buffer.length < this.offset + n) {
          throw new Error("Cannot read slice out of bounds");
        }
        const result = this.buffer.slice(this.offset, this.offset + n);
        this.offset += n;
        return result;
      }
      readVarSlice() {
        return this.readSlice(this.readVarInt());
      }
      readVector() {
        const count = this.readVarInt();
        const vector = [];
        for (let i = 0; i < count; i++) vector.push(this.readVarSlice());
        return vector;
      }
    };
    exports2.BufferReader = BufferReader;
  }
});

// node_modules/bitcoinjs-lib/src/payments/bip341.js
var require_bip341 = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/bip341.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.tweakKey = exports2.tapTweakHash = exports2.tapleafHash = exports2.findScriptPath = exports2.toHashTree = exports2.rootHashFromPath = exports2.MAX_TAPTREE_DEPTH = exports2.LEAF_VERSION_TAPSCRIPT = void 0;
    var buffer_1 = require("buffer");
    var ecc_lib_1 = require_ecc_lib();
    var bcrypto = require_crypto();
    var bufferutils_1 = require_bufferutils();
    var types_1 = require_types();
    exports2.LEAF_VERSION_TAPSCRIPT = 192;
    exports2.MAX_TAPTREE_DEPTH = 128;
    var isHashBranch = (ht) => "left" in ht && "right" in ht;
    function rootHashFromPath(controlBlock, leafHash) {
      if (controlBlock.length < 33)
        throw new TypeError(
          `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
        );
      const m = (controlBlock.length - 33) / 32;
      let kj = leafHash;
      for (let j = 0; j < m; j++) {
        const ej = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
        if (kj.compare(ej) < 0) {
          kj = tapBranchHash(kj, ej);
        } else {
          kj = tapBranchHash(ej, kj);
        }
      }
      return kj;
    }
    exports2.rootHashFromPath = rootHashFromPath;
    function toHashTree(scriptTree) {
      if ((0, types_1.isTapleaf)(scriptTree))
        return { hash: tapleafHash(scriptTree) };
      const hashes = [toHashTree(scriptTree[0]), toHashTree(scriptTree[1])];
      hashes.sort((a, b) => a.hash.compare(b.hash));
      const [left, right] = hashes;
      return {
        hash: tapBranchHash(left.hash, right.hash),
        left,
        right
      };
    }
    exports2.toHashTree = toHashTree;
    function findScriptPath(node, hash) {
      if (isHashBranch(node)) {
        const leftPath = findScriptPath(node.left, hash);
        if (leftPath !== void 0) return [...leftPath, node.right.hash];
        const rightPath = findScriptPath(node.right, hash);
        if (rightPath !== void 0) return [...rightPath, node.left.hash];
      } else if (node.hash.equals(hash)) {
        return [];
      }
      return void 0;
    }
    exports2.findScriptPath = findScriptPath;
    function tapleafHash(leaf) {
      const version = leaf.version || exports2.LEAF_VERSION_TAPSCRIPT;
      return bcrypto.taggedHash(
        "TapLeaf",
        buffer_1.Buffer.concat([
          buffer_1.Buffer.from([version]),
          serializeScript(leaf.output)
        ])
      );
    }
    exports2.tapleafHash = tapleafHash;
    function tapTweakHash(pubKey, h2) {
      return bcrypto.taggedHash(
        "TapTweak",
        buffer_1.Buffer.concat(h2 ? [pubKey, h2] : [pubKey])
      );
    }
    exports2.tapTweakHash = tapTweakHash;
    function tweakKey(pubKey, h2) {
      if (!buffer_1.Buffer.isBuffer(pubKey)) return null;
      if (pubKey.length !== 32) return null;
      if (h2 && h2.length !== 32) return null;
      const tweakHash = tapTweakHash(pubKey, h2);
      const res = (0, ecc_lib_1.getEccLib)().xOnlyPointAddTweak(pubKey, tweakHash);
      if (!res || res.xOnlyPubkey === null) return null;
      return {
        parity: res.parity,
        x: buffer_1.Buffer.from(res.xOnlyPubkey)
      };
    }
    exports2.tweakKey = tweakKey;
    function tapBranchHash(a, b) {
      return bcrypto.taggedHash("TapBranch", buffer_1.Buffer.concat([a, b]));
    }
    function serializeScript(s) {
      const varintLen = bufferutils_1.varuint.encodingLength(s.length);
      const buffer = buffer_1.Buffer.allocUnsafe(varintLen);
      bufferutils_1.varuint.encode(s.length, buffer);
      return buffer_1.Buffer.concat([buffer, s]);
    }
  }
});

// node_modules/bitcoinjs-lib/src/payments/p2tr.js
var require_p2tr = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/p2tr.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2tr = void 0;
    var buffer_1 = require("buffer");
    var networks_1 = require_networks();
    var bscript = require_script();
    var types_1 = require_types();
    var ecc_lib_1 = require_ecc_lib();
    var bip341_1 = require_bip341();
    var lazy = require_lazy();
    var bech32_1 = require_dist();
    var address_1 = require_address();
    var OPS = bscript.OPS;
    var TAPROOT_WITNESS_VERSION = 1;
    var ANNEX_PREFIX = 80;
    function p2tr(a, opts) {
      if (!a.address && !a.output && !a.pubkey && !a.internalPubkey && !(a.witness && a.witness.length > 1))
        throw new TypeError("Not enough data");
      opts = Object.assign({ validate: true }, opts || {});
      (0, types_1.typeforce)(
        {
          address: types_1.typeforce.maybe(types_1.typeforce.String),
          input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
          network: types_1.typeforce.maybe(types_1.typeforce.Object),
          output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
          internalPubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
          hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
          pubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
          signature: types_1.typeforce.maybe(
            types_1.typeforce.anyOf(
              types_1.typeforce.BufferN(64),
              types_1.typeforce.BufferN(65)
            )
          ),
          witness: types_1.typeforce.maybe(
            types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
          ),
          scriptTree: types_1.typeforce.maybe(types_1.isTaptree),
          redeem: types_1.typeforce.maybe({
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          }),
          redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number)
        },
        a
      );
      const _address = lazy.value(() => {
        return (0, address_1.fromBech32)(a.address);
      });
      const _witness = lazy.value(() => {
        if (!a.witness || !a.witness.length) return;
        if (a.witness.length >= 2 && a.witness[a.witness.length - 1][0] === ANNEX_PREFIX) {
          return a.witness.slice(0, -1);
        }
        return a.witness.slice();
      });
      const _hashTree = lazy.value(() => {
        if (a.scriptTree) return (0, bip341_1.toHashTree)(a.scriptTree);
        if (a.hash) return { hash: a.hash };
        return;
      });
      const network = a.network || networks_1.bitcoin;
      const o = { name: "p2tr", network };
      lazy.prop(o, "address", () => {
        if (!o.pubkey) return;
        const words = bech32_1.bech32m.toWords(o.pubkey);
        words.unshift(TAPROOT_WITNESS_VERSION);
        return bech32_1.bech32m.encode(network.bech32, words);
      });
      lazy.prop(o, "hash", () => {
        const hashTree = _hashTree();
        if (hashTree) return hashTree.hash;
        const w = _witness();
        if (w && w.length > 1) {
          const controlBlock = w[w.length - 1];
          const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
          const script2 = w[w.length - 2];
          const leafHash = (0, bip341_1.tapleafHash)({
            output: script2,
            version: leafVersion
          });
          return (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
        }
        return null;
      });
      lazy.prop(o, "output", () => {
        if (!o.pubkey) return;
        return bscript.compile([OPS.OP_1, o.pubkey]);
      });
      lazy.prop(o, "redeemVersion", () => {
        if (a.redeemVersion) return a.redeemVersion;
        if (a.redeem && a.redeem.redeemVersion !== void 0 && a.redeem.redeemVersion !== null) {
          return a.redeem.redeemVersion;
        }
        return bip341_1.LEAF_VERSION_TAPSCRIPT;
      });
      lazy.prop(o, "redeem", () => {
        const witness = _witness();
        if (!witness || witness.length < 2) return;
        return {
          output: witness[witness.length - 2],
          witness: witness.slice(0, -2),
          redeemVersion: witness[witness.length - 1][0] & types_1.TAPLEAF_VERSION_MASK
        };
      });
      lazy.prop(o, "pubkey", () => {
        if (a.pubkey) return a.pubkey;
        if (a.output) return a.output.slice(2);
        if (a.address) return _address().data;
        if (o.internalPubkey) {
          const tweakedKey = (0, bip341_1.tweakKey)(o.internalPubkey, o.hash);
          if (tweakedKey) return tweakedKey.x;
        }
      });
      lazy.prop(o, "internalPubkey", () => {
        if (a.internalPubkey) return a.internalPubkey;
        const witness = _witness();
        if (witness && witness.length > 1)
          return witness[witness.length - 1].slice(1, 33);
      });
      lazy.prop(o, "signature", () => {
        if (a.signature) return a.signature;
        const witness = _witness();
        if (!witness || witness.length !== 1) return;
        return witness[0];
      });
      lazy.prop(o, "witness", () => {
        if (a.witness) return a.witness;
        const hashTree = _hashTree();
        if (hashTree && a.redeem && a.redeem.output && a.internalPubkey) {
          const leafHash = (0, bip341_1.tapleafHash)({
            output: a.redeem.output,
            version: o.redeemVersion
          });
          const path = (0, bip341_1.findScriptPath)(hashTree, leafHash);
          if (!path) return;
          const outputKey = (0, bip341_1.tweakKey)(a.internalPubkey, hashTree.hash);
          if (!outputKey) return;
          const controlBock = buffer_1.Buffer.concat(
            [
              buffer_1.Buffer.from([o.redeemVersion | outputKey.parity]),
              a.internalPubkey
            ].concat(path)
          );
          return [a.redeem.output, controlBock];
        }
        if (a.signature) return [a.signature];
      });
      if (opts.validate) {
        let pubkey = buffer_1.Buffer.from([]);
        if (a.address) {
          if (network && network.bech32 !== _address().prefix)
            throw new TypeError("Invalid prefix or Network mismatch");
          if (_address().version !== TAPROOT_WITNESS_VERSION)
            throw new TypeError("Invalid address version");
          if (_address().data.length !== 32)
            throw new TypeError("Invalid address data");
          pubkey = _address().data;
        }
        if (a.pubkey) {
          if (pubkey.length > 0 && !pubkey.equals(a.pubkey))
            throw new TypeError("Pubkey mismatch");
          else pubkey = a.pubkey;
        }
        if (a.output) {
          if (a.output.length !== 34 || a.output[0] !== OPS.OP_1 || a.output[1] !== 32)
            throw new TypeError("Output is invalid");
          if (pubkey.length > 0 && !pubkey.equals(a.output.slice(2)))
            throw new TypeError("Pubkey mismatch");
          else pubkey = a.output.slice(2);
        }
        if (a.internalPubkey) {
          const tweakedKey = (0, bip341_1.tweakKey)(a.internalPubkey, o.hash);
          if (pubkey.length > 0 && !pubkey.equals(tweakedKey.x))
            throw new TypeError("Pubkey mismatch");
          else pubkey = tweakedKey.x;
        }
        if (pubkey && pubkey.length) {
          if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(pubkey))
            throw new TypeError("Invalid pubkey for p2tr");
        }
        const hashTree = _hashTree();
        if (a.hash && hashTree) {
          if (!a.hash.equals(hashTree.hash)) throw new TypeError("Hash mismatch");
        }
        if (a.redeem && a.redeem.output && hashTree) {
          const leafHash = (0, bip341_1.tapleafHash)({
            output: a.redeem.output,
            version: o.redeemVersion
          });
          if (!(0, bip341_1.findScriptPath)(hashTree, leafHash))
            throw new TypeError("Redeem script not in tree");
        }
        const witness = _witness();
        if (a.redeem && o.redeem) {
          if (a.redeem.redeemVersion) {
            if (a.redeem.redeemVersion !== o.redeem.redeemVersion)
              throw new TypeError("Redeem.redeemVersion and witness mismatch");
          }
          if (a.redeem.output) {
            if (bscript.decompile(a.redeem.output).length === 0)
              throw new TypeError("Redeem.output is invalid");
            if (o.redeem.output && !a.redeem.output.equals(o.redeem.output))
              throw new TypeError("Redeem.output and witness mismatch");
          }
          if (a.redeem.witness) {
            if (o.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, o.redeem.witness))
              throw new TypeError("Redeem.witness and witness mismatch");
          }
        }
        if (witness && witness.length) {
          if (witness.length === 1) {
            if (a.signature && !a.signature.equals(witness[0]))
              throw new TypeError("Signature mismatch");
          } else {
            const controlBlock = witness[witness.length - 1];
            if (controlBlock.length < 33)
              throw new TypeError(
                `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
              );
            if ((controlBlock.length - 33) % 32 !== 0)
              throw new TypeError(
                `The control-block length of ${controlBlock.length} is incorrect!`
              );
            const m = (controlBlock.length - 33) / 32;
            if (m > 128)
              throw new TypeError(
                `The script path is too long. Got ${m}, expected max 128.`
              );
            const internalPubkey = controlBlock.slice(1, 33);
            if (a.internalPubkey && !a.internalPubkey.equals(internalPubkey))
              throw new TypeError("Internal pubkey mismatch");
            if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(internalPubkey))
              throw new TypeError("Invalid internalPubkey for p2tr witness");
            const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
            const script2 = witness[witness.length - 2];
            const leafHash = (0, bip341_1.tapleafHash)({
              output: script2,
              version: leafVersion
            });
            const hash = (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
            const outputKey = (0, bip341_1.tweakKey)(internalPubkey, hash);
            if (!outputKey)
              throw new TypeError("Invalid outputKey for p2tr witness");
            if (pubkey.length && !pubkey.equals(outputKey.x))
              throw new TypeError("Pubkey mismatch for p2tr witness");
            if (outputKey.parity !== (controlBlock[0] & 1))
              throw new Error("Incorrect parity");
          }
        }
      }
      return Object.assign(o, a);
    }
    exports2.p2tr = p2tr;
  }
});

// node_modules/bitcoinjs-lib/src/payments/index.js
var require_payments = __commonJS({
  "node_modules/bitcoinjs-lib/src/payments/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.p2tr = exports2.p2wsh = exports2.p2wpkh = exports2.p2sh = exports2.p2pkh = exports2.p2pk = exports2.p2ms = exports2.embed = void 0;
    var embed_1 = require_embed();
    Object.defineProperty(exports2, "embed", {
      enumerable: true,
      get: function() {
        return embed_1.p2data;
      }
    });
    var p2ms_1 = require_p2ms();
    Object.defineProperty(exports2, "p2ms", {
      enumerable: true,
      get: function() {
        return p2ms_1.p2ms;
      }
    });
    var p2pk_1 = require_p2pk();
    Object.defineProperty(exports2, "p2pk", {
      enumerable: true,
      get: function() {
        return p2pk_1.p2pk;
      }
    });
    var p2pkh_1 = require_p2pkh();
    Object.defineProperty(exports2, "p2pkh", {
      enumerable: true,
      get: function() {
        return p2pkh_1.p2pkh;
      }
    });
    var p2sh_1 = require_p2sh();
    Object.defineProperty(exports2, "p2sh", {
      enumerable: true,
      get: function() {
        return p2sh_1.p2sh;
      }
    });
    var p2wpkh_1 = require_p2wpkh();
    Object.defineProperty(exports2, "p2wpkh", {
      enumerable: true,
      get: function() {
        return p2wpkh_1.p2wpkh;
      }
    });
    var p2wsh_1 = require_p2wsh();
    Object.defineProperty(exports2, "p2wsh", {
      enumerable: true,
      get: function() {
        return p2wsh_1.p2wsh;
      }
    });
    var p2tr_1 = require_p2tr();
    Object.defineProperty(exports2, "p2tr", {
      enumerable: true,
      get: function() {
        return p2tr_1.p2tr;
      }
    });
  }
});

// node_modules/bitcoinjs-lib/src/address.js
var require_address = __commonJS({
  "node_modules/bitcoinjs-lib/src/address.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toOutputScript = exports2.fromOutputScript = exports2.toBech32 = exports2.toBase58Check = exports2.fromBech32 = exports2.fromBase58Check = void 0;
    var networks = require_networks();
    var payments = require_payments();
    var bscript = require_script();
    var types_1 = require_types();
    var bech32_1 = require_dist();
    var bs58check = require_bs58check();
    var FUTURE_SEGWIT_MAX_SIZE = 40;
    var FUTURE_SEGWIT_MIN_SIZE = 2;
    var FUTURE_SEGWIT_MAX_VERSION = 16;
    var FUTURE_SEGWIT_MIN_VERSION = 2;
    var FUTURE_SEGWIT_VERSION_DIFF = 80;
    var FUTURE_SEGWIT_VERSION_WARNING = "WARNING: Sending to a future segwit version address can lead to loss of funds. End users MUST be warned carefully in the GUI and asked if they wish to proceed with caution. Wallets should verify the segwit version from the output of fromBech32, then decide when it is safe to use which version of segwit.";
    function _toFutureSegwitAddress(output, network) {
      const data = output.slice(2);
      if (data.length < FUTURE_SEGWIT_MIN_SIZE || data.length > FUTURE_SEGWIT_MAX_SIZE)
        throw new TypeError("Invalid program length for segwit address");
      const version = output[0] - FUTURE_SEGWIT_VERSION_DIFF;
      if (version < FUTURE_SEGWIT_MIN_VERSION || version > FUTURE_SEGWIT_MAX_VERSION)
        throw new TypeError("Invalid version for segwit address");
      if (output[1] !== data.length)
        throw new TypeError("Invalid script for segwit address");
      console.warn(FUTURE_SEGWIT_VERSION_WARNING);
      return toBech32(data, version, network.bech32);
    }
    function fromBase58Check(address) {
      const payload = Buffer.from(bs58check.decode(address));
      if (payload.length < 21) throw new TypeError(address + " is too short");
      if (payload.length > 21) throw new TypeError(address + " is too long");
      const version = payload.readUInt8(0);
      const hash = payload.slice(1);
      return { version, hash };
    }
    exports2.fromBase58Check = fromBase58Check;
    function fromBech32(address) {
      let result;
      let version;
      try {
        result = bech32_1.bech32.decode(address);
      } catch (e) {
      }
      if (result) {
        version = result.words[0];
        if (version !== 0) throw new TypeError(address + " uses wrong encoding");
      } else {
        result = bech32_1.bech32m.decode(address);
        version = result.words[0];
        if (version === 0) throw new TypeError(address + " uses wrong encoding");
      }
      const data = bech32_1.bech32.fromWords(result.words.slice(1));
      return {
        version,
        prefix: result.prefix,
        data: Buffer.from(data)
      };
    }
    exports2.fromBech32 = fromBech32;
    function toBase58Check(hash, version) {
      (0, types_1.typeforce)(
        (0, types_1.tuple)(types_1.Hash160bit, types_1.UInt8),
        arguments
      );
      const payload = Buffer.allocUnsafe(21);
      payload.writeUInt8(version, 0);
      hash.copy(payload, 1);
      return bs58check.encode(payload);
    }
    exports2.toBase58Check = toBase58Check;
    function toBech32(data, version, prefix) {
      const words = bech32_1.bech32.toWords(data);
      words.unshift(version);
      return version === 0 ? bech32_1.bech32.encode(prefix, words) : bech32_1.bech32m.encode(prefix, words);
    }
    exports2.toBech32 = toBech32;
    function fromOutputScript(output, network) {
      network = network || networks.bitcoin;
      try {
        return payments.p2pkh({ output, network }).address;
      } catch (e) {
      }
      try {
        return payments.p2sh({ output, network }).address;
      } catch (e) {
      }
      try {
        return payments.p2wpkh({ output, network }).address;
      } catch (e) {
      }
      try {
        return payments.p2wsh({ output, network }).address;
      } catch (e) {
      }
      try {
        return payments.p2tr({ output, network }).address;
      } catch (e) {
      }
      try {
        return _toFutureSegwitAddress(output, network);
      } catch (e) {
      }
      throw new Error(bscript.toASM(output) + " has no matching Address");
    }
    exports2.fromOutputScript = fromOutputScript;
    function toOutputScript(address, network) {
      network = network || networks.bitcoin;
      let decodeBase58;
      let decodeBech32;
      try {
        decodeBase58 = fromBase58Check(address);
      } catch (e) {
      }
      if (decodeBase58) {
        if (decodeBase58.version === network.pubKeyHash)
          return payments.p2pkh({ hash: decodeBase58.hash }).output;
        if (decodeBase58.version === network.scriptHash)
          return payments.p2sh({ hash: decodeBase58.hash }).output;
      } else {
        try {
          decodeBech32 = fromBech32(address);
        } catch (e) {
        }
        if (decodeBech32) {
          if (decodeBech32.prefix !== network.bech32)
            throw new Error(address + " has an invalid prefix");
          if (decodeBech32.version === 0) {
            if (decodeBech32.data.length === 20)
              return payments.p2wpkh({ hash: decodeBech32.data }).output;
            if (decodeBech32.data.length === 32)
              return payments.p2wsh({ hash: decodeBech32.data }).output;
          } else if (decodeBech32.version === 1) {
            if (decodeBech32.data.length === 32)
              return payments.p2tr({ pubkey: decodeBech32.data }).output;
          } else if (decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION && decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION && decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE && decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE) {
            console.warn(FUTURE_SEGWIT_VERSION_WARNING);
            return bscript.compile([
              decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF,
              decodeBech32.data
            ]);
          }
        }
      }
      throw new Error(address + " has no matching Script");
    }
    exports2.toOutputScript = toOutputScript;
  }
});

// node_modules/bitcoinjs-lib/src/merkle.js
var require_merkle = __commonJS({
  "node_modules/bitcoinjs-lib/src/merkle.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fastMerkleRoot = void 0;
    function fastMerkleRoot(values, digestFn) {
      if (!Array.isArray(values)) throw TypeError("Expected values Array");
      if (typeof digestFn !== "function")
        throw TypeError("Expected digest Function");
      let length2 = values.length;
      const results = values.concat();
      while (length2 > 1) {
        let j = 0;
        for (let i = 0; i < length2; i += 2, ++j) {
          const left = results[i];
          const right = i + 1 === length2 ? left : results[i + 1];
          const data = Buffer.concat([left, right]);
          results[j] = digestFn(data);
        }
        length2 = j;
      }
      return results[0];
    }
    exports2.fastMerkleRoot = fastMerkleRoot;
  }
});

// node_modules/bitcoinjs-lib/src/transaction.js
var require_transaction = __commonJS({
  "node_modules/bitcoinjs-lib/src/transaction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Transaction = void 0;
    var bufferutils_1 = require_bufferutils();
    var bcrypto = require_crypto();
    var bscript = require_script();
    var script_1 = require_script();
    var types = require_types();
    var { typeforce } = types;
    function varSliceSize(someScript) {
      const length2 = someScript.length;
      return bufferutils_1.varuint.encodingLength(length2) + length2;
    }
    function vectorSize(someVector) {
      const length2 = someVector.length;
      return bufferutils_1.varuint.encodingLength(length2) + someVector.reduce((sum, witness) => {
        return sum + varSliceSize(witness);
      }, 0);
    }
    var EMPTY_BUFFER = Buffer.allocUnsafe(0);
    var EMPTY_WITNESS = [];
    var ZERO = Buffer.from(
      "0000000000000000000000000000000000000000000000000000000000000000",
      "hex"
    );
    var ONE = Buffer.from(
      "0000000000000000000000000000000000000000000000000000000000000001",
      "hex"
    );
    var VALUE_UINT64_MAX = Buffer.from("ffffffffffffffff", "hex");
    var BLANK_OUTPUT = {
      script: EMPTY_BUFFER,
      valueBuffer: VALUE_UINT64_MAX
    };
    function isOutput(out) {
      return out.value !== void 0;
    }
    var Transaction2 = class _Transaction {
      constructor() {
        this.version = 1;
        this.locktime = 0;
        this.ins = [];
        this.outs = [];
      }
      static fromBuffer(buffer, _NO_STRICT) {
        const bufferReader = new bufferutils_1.BufferReader(buffer);
        const tx = new _Transaction();
        tx.version = bufferReader.readInt32();
        const marker = bufferReader.readUInt8();
        const flag = bufferReader.readUInt8();
        let hasWitnesses = false;
        if (marker === _Transaction.ADVANCED_TRANSACTION_MARKER && flag === _Transaction.ADVANCED_TRANSACTION_FLAG) {
          hasWitnesses = true;
        } else {
          bufferReader.offset -= 2;
        }
        const vinLen = bufferReader.readVarInt();
        for (let i = 0; i < vinLen; ++i) {
          tx.ins.push({
            hash: bufferReader.readSlice(32),
            index: bufferReader.readUInt32(),
            script: bufferReader.readVarSlice(),
            sequence: bufferReader.readUInt32(),
            witness: EMPTY_WITNESS
          });
        }
        const voutLen = bufferReader.readVarInt();
        for (let i = 0; i < voutLen; ++i) {
          tx.outs.push({
            value: bufferReader.readUInt64(),
            script: bufferReader.readVarSlice()
          });
        }
        if (hasWitnesses) {
          for (let i = 0; i < vinLen; ++i) {
            tx.ins[i].witness = bufferReader.readVector();
          }
          if (!tx.hasWitnesses())
            throw new Error("Transaction has superfluous witness data");
        }
        tx.locktime = bufferReader.readUInt32();
        if (_NO_STRICT) return tx;
        if (bufferReader.offset !== buffer.length)
          throw new Error("Transaction has unexpected data");
        return tx;
      }
      static fromHex(hex) {
        return _Transaction.fromBuffer(Buffer.from(hex, "hex"), false);
      }
      static isCoinbaseHash(buffer) {
        typeforce(types.Hash256bit, buffer);
        for (let i = 0; i < 32; ++i) {
          if (buffer[i] !== 0) return false;
        }
        return true;
      }
      isCoinbase() {
        return this.ins.length === 1 && _Transaction.isCoinbaseHash(this.ins[0].hash);
      }
      addInput(hash, index, sequence, scriptSig) {
        typeforce(
          types.tuple(
            types.Hash256bit,
            types.UInt32,
            types.maybe(types.UInt32),
            types.maybe(types.Buffer)
          ),
          arguments
        );
        if (types.Null(sequence)) {
          sequence = _Transaction.DEFAULT_SEQUENCE;
        }
        return this.ins.push({
          hash,
          index,
          script: scriptSig || EMPTY_BUFFER,
          sequence,
          witness: EMPTY_WITNESS
        }) - 1;
      }
      addOutput(scriptPubKey, value) {
        typeforce(types.tuple(types.Buffer, types.Satoshi), arguments);
        return this.outs.push({
          script: scriptPubKey,
          value
        }) - 1;
      }
      hasWitnesses() {
        return this.ins.some((x) => {
          return x.witness.length !== 0;
        });
      }
      stripWitnesses() {
        this.ins.forEach((input) => {
          input.witness = EMPTY_WITNESS;
        });
      }
      weight() {
        const base2 = this.byteLength(false);
        const total = this.byteLength(true);
        return base2 * 3 + total;
      }
      virtualSize() {
        return Math.ceil(this.weight() / 4);
      }
      byteLength(_ALLOW_WITNESS = true) {
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        return (hasWitnesses ? 10 : 8) + bufferutils_1.varuint.encodingLength(this.ins.length) + bufferutils_1.varuint.encodingLength(this.outs.length) + this.ins.reduce((sum, input) => {
          return sum + 40 + varSliceSize(input.script);
        }, 0) + this.outs.reduce((sum, output) => {
          return sum + 8 + varSliceSize(output.script);
        }, 0) + (hasWitnesses ? this.ins.reduce((sum, input) => {
          return sum + vectorSize(input.witness);
        }, 0) : 0);
      }
      clone() {
        const newTx = new _Transaction();
        newTx.version = this.version;
        newTx.locktime = this.locktime;
        newTx.ins = this.ins.map((txIn) => {
          return {
            hash: txIn.hash,
            index: txIn.index,
            script: txIn.script,
            sequence: txIn.sequence,
            witness: txIn.witness
          };
        });
        newTx.outs = this.outs.map((txOut) => {
          return {
            script: txOut.script,
            value: txOut.value
          };
        });
        return newTx;
      }
      /**
       * Hash transaction for signing a specific input.
       *
       * Bitcoin uses a different hash for each signed transaction input.
       * This method copies the transaction, makes the necessary changes based on the
       * hashType, and then hashes the result.
       * This hash can then be used to sign the provided transaction input.
       */
      hashForSignature(inIndex, prevOutScript, hashType) {
        typeforce(
          types.tuple(
            types.UInt32,
            types.Buffer,
            /* types.UInt8 */
            types.Number
          ),
          arguments
        );
        if (inIndex >= this.ins.length) return ONE;
        const ourScript = bscript.compile(
          bscript.decompile(prevOutScript).filter((x) => {
            return x !== script_1.OPS.OP_CODESEPARATOR;
          })
        );
        const txTmp = this.clone();
        if ((hashType & 31) === _Transaction.SIGHASH_NONE) {
          txTmp.outs = [];
          txTmp.ins.forEach((input, i) => {
            if (i === inIndex) return;
            input.sequence = 0;
          });
        } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE) {
          if (inIndex >= this.outs.length) return ONE;
          txTmp.outs.length = inIndex + 1;
          for (let i = 0; i < inIndex; i++) {
            txTmp.outs[i] = BLANK_OUTPUT;
          }
          txTmp.ins.forEach((input, y) => {
            if (y === inIndex) return;
            input.sequence = 0;
          });
        }
        if (hashType & _Transaction.SIGHASH_ANYONECANPAY) {
          txTmp.ins = [txTmp.ins[inIndex]];
          txTmp.ins[0].script = ourScript;
        } else {
          txTmp.ins.forEach((input) => {
            input.script = EMPTY_BUFFER;
          });
          txTmp.ins[inIndex].script = ourScript;
        }
        const buffer = Buffer.allocUnsafe(txTmp.byteLength(false) + 4);
        buffer.writeInt32LE(hashType, buffer.length - 4);
        txTmp.__toBuffer(buffer, 0, false);
        return bcrypto.hash256(buffer);
      }
      hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
        typeforce(
          types.tuple(
            types.UInt32,
            typeforce.arrayOf(types.Buffer),
            typeforce.arrayOf(types.Satoshi),
            types.UInt32
          ),
          arguments
        );
        if (values.length !== this.ins.length || prevOutScripts.length !== this.ins.length) {
          throw new Error("Must supply prevout script and value for all inputs");
        }
        const outputType = hashType === _Transaction.SIGHASH_DEFAULT ? _Transaction.SIGHASH_ALL : hashType & _Transaction.SIGHASH_OUTPUT_MASK;
        const inputType = hashType & _Transaction.SIGHASH_INPUT_MASK;
        const isAnyoneCanPay = inputType === _Transaction.SIGHASH_ANYONECANPAY;
        const isNone = outputType === _Transaction.SIGHASH_NONE;
        const isSingle = outputType === _Transaction.SIGHASH_SINGLE;
        let hashPrevouts = EMPTY_BUFFER;
        let hashAmounts = EMPTY_BUFFER;
        let hashScriptPubKeys = EMPTY_BUFFER;
        let hashSequences = EMPTY_BUFFER;
        let hashOutputs = EMPTY_BUFFER;
        if (!isAnyoneCanPay) {
          let bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            36 * this.ins.length
          );
          this.ins.forEach((txIn) => {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
          });
          hashPrevouts = bcrypto.sha256(bufferWriter.end());
          bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            8 * this.ins.length
          );
          values.forEach((value) => bufferWriter.writeUInt64(value));
          hashAmounts = bcrypto.sha256(bufferWriter.end());
          bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            prevOutScripts.map(varSliceSize).reduce((a, b) => a + b)
          );
          prevOutScripts.forEach(
            (prevOutScript) => bufferWriter.writeVarSlice(prevOutScript)
          );
          hashScriptPubKeys = bcrypto.sha256(bufferWriter.end());
          bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            4 * this.ins.length
          );
          this.ins.forEach((txIn) => bufferWriter.writeUInt32(txIn.sequence));
          hashSequences = bcrypto.sha256(bufferWriter.end());
        }
        if (!(isNone || isSingle)) {
          const txOutsSize = this.outs.map((output) => 8 + varSliceSize(output.script)).reduce((a, b) => a + b);
          const bufferWriter = bufferutils_1.BufferWriter.withCapacity(txOutsSize);
          this.outs.forEach((out) => {
            bufferWriter.writeUInt64(out.value);
            bufferWriter.writeVarSlice(out.script);
          });
          hashOutputs = bcrypto.sha256(bufferWriter.end());
        } else if (isSingle && inIndex < this.outs.length) {
          const output = this.outs[inIndex];
          const bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            8 + varSliceSize(output.script)
          );
          bufferWriter.writeUInt64(output.value);
          bufferWriter.writeVarSlice(output.script);
          hashOutputs = bcrypto.sha256(bufferWriter.end());
        }
        const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
        const sigMsgSize = 174 - (isAnyoneCanPay ? 49 : 0) - (isNone ? 32 : 0) + (annex ? 32 : 0) + (leafHash ? 37 : 0);
        const sigMsgWriter = bufferutils_1.BufferWriter.withCapacity(sigMsgSize);
        sigMsgWriter.writeUInt8(hashType);
        sigMsgWriter.writeInt32(this.version);
        sigMsgWriter.writeUInt32(this.locktime);
        sigMsgWriter.writeSlice(hashPrevouts);
        sigMsgWriter.writeSlice(hashAmounts);
        sigMsgWriter.writeSlice(hashScriptPubKeys);
        sigMsgWriter.writeSlice(hashSequences);
        if (!(isNone || isSingle)) {
          sigMsgWriter.writeSlice(hashOutputs);
        }
        sigMsgWriter.writeUInt8(spendType);
        if (isAnyoneCanPay) {
          const input = this.ins[inIndex];
          sigMsgWriter.writeSlice(input.hash);
          sigMsgWriter.writeUInt32(input.index);
          sigMsgWriter.writeUInt64(values[inIndex]);
          sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
          sigMsgWriter.writeUInt32(input.sequence);
        } else {
          sigMsgWriter.writeUInt32(inIndex);
        }
        if (annex) {
          const bufferWriter = bufferutils_1.BufferWriter.withCapacity(
            varSliceSize(annex)
          );
          bufferWriter.writeVarSlice(annex);
          sigMsgWriter.writeSlice(bcrypto.sha256(bufferWriter.end()));
        }
        if (isSingle) {
          sigMsgWriter.writeSlice(hashOutputs);
        }
        if (leafHash) {
          sigMsgWriter.writeSlice(leafHash);
          sigMsgWriter.writeUInt8(0);
          sigMsgWriter.writeUInt32(4294967295);
        }
        return bcrypto.taggedHash(
          "TapSighash",
          Buffer.concat([Buffer.from([0]), sigMsgWriter.end()])
        );
      }
      hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
        typeforce(
          types.tuple(types.UInt32, types.Buffer, types.Satoshi, types.UInt32),
          arguments
        );
        let tbuffer = Buffer.from([]);
        let bufferWriter;
        let hashOutputs = ZERO;
        let hashPrevouts = ZERO;
        let hashSequence = ZERO;
        if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY)) {
          tbuffer = Buffer.allocUnsafe(36 * this.ins.length);
          bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
          this.ins.forEach((txIn) => {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
          });
          hashPrevouts = bcrypto.hash256(tbuffer);
        }
        if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY) && (hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
          tbuffer = Buffer.allocUnsafe(4 * this.ins.length);
          bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
          this.ins.forEach((txIn) => {
            bufferWriter.writeUInt32(txIn.sequence);
          });
          hashSequence = bcrypto.hash256(tbuffer);
        }
        if ((hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
          const txOutsSize = this.outs.reduce((sum, output) => {
            return sum + 8 + varSliceSize(output.script);
          }, 0);
          tbuffer = Buffer.allocUnsafe(txOutsSize);
          bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
          this.outs.forEach((out) => {
            bufferWriter.writeUInt64(out.value);
            bufferWriter.writeVarSlice(out.script);
          });
          hashOutputs = bcrypto.hash256(tbuffer);
        } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
          const output = this.outs[inIndex];
          tbuffer = Buffer.allocUnsafe(8 + varSliceSize(output.script));
          bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
          bufferWriter.writeUInt64(output.value);
          bufferWriter.writeVarSlice(output.script);
          hashOutputs = bcrypto.hash256(tbuffer);
        }
        tbuffer = Buffer.allocUnsafe(156 + varSliceSize(prevOutScript));
        bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
        const input = this.ins[inIndex];
        bufferWriter.writeInt32(this.version);
        bufferWriter.writeSlice(hashPrevouts);
        bufferWriter.writeSlice(hashSequence);
        bufferWriter.writeSlice(input.hash);
        bufferWriter.writeUInt32(input.index);
        bufferWriter.writeVarSlice(prevOutScript);
        bufferWriter.writeUInt64(value);
        bufferWriter.writeUInt32(input.sequence);
        bufferWriter.writeSlice(hashOutputs);
        bufferWriter.writeUInt32(this.locktime);
        bufferWriter.writeUInt32(hashType);
        return bcrypto.hash256(tbuffer);
      }
      getHash(forWitness) {
        if (forWitness && this.isCoinbase()) return Buffer.alloc(32, 0);
        return bcrypto.hash256(this.__toBuffer(void 0, void 0, forWitness));
      }
      getId() {
        return (0, bufferutils_1.reverseBuffer)(this.getHash(false)).toString(
          "hex"
        );
      }
      toBuffer(buffer, initialOffset) {
        return this.__toBuffer(buffer, initialOffset, true);
      }
      toHex() {
        return this.toBuffer(void 0, void 0).toString("hex");
      }
      setInputScript(index, scriptSig) {
        typeforce(types.tuple(types.Number, types.Buffer), arguments);
        this.ins[index].script = scriptSig;
      }
      setWitness(index, witness) {
        typeforce(types.tuple(types.Number, [types.Buffer]), arguments);
        this.ins[index].witness = witness;
      }
      __toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
        if (!buffer) buffer = Buffer.allocUnsafe(this.byteLength(_ALLOW_WITNESS));
        const bufferWriter = new bufferutils_1.BufferWriter(
          buffer,
          initialOffset || 0
        );
        bufferWriter.writeInt32(this.version);
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        if (hasWitnesses) {
          bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_MARKER);
          bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_FLAG);
        }
        bufferWriter.writeVarInt(this.ins.length);
        this.ins.forEach((txIn) => {
          bufferWriter.writeSlice(txIn.hash);
          bufferWriter.writeUInt32(txIn.index);
          bufferWriter.writeVarSlice(txIn.script);
          bufferWriter.writeUInt32(txIn.sequence);
        });
        bufferWriter.writeVarInt(this.outs.length);
        this.outs.forEach((txOut) => {
          if (isOutput(txOut)) {
            bufferWriter.writeUInt64(txOut.value);
          } else {
            bufferWriter.writeSlice(txOut.valueBuffer);
          }
          bufferWriter.writeVarSlice(txOut.script);
        });
        if (hasWitnesses) {
          this.ins.forEach((input) => {
            bufferWriter.writeVector(input.witness);
          });
        }
        bufferWriter.writeUInt32(this.locktime);
        if (initialOffset !== void 0)
          return buffer.slice(initialOffset, bufferWriter.offset);
        return buffer;
      }
    };
    exports2.Transaction = Transaction2;
    Transaction2.DEFAULT_SEQUENCE = 4294967295;
    Transaction2.SIGHASH_DEFAULT = 0;
    Transaction2.SIGHASH_ALL = 1;
    Transaction2.SIGHASH_NONE = 2;
    Transaction2.SIGHASH_SINGLE = 3;
    Transaction2.SIGHASH_ANYONECANPAY = 128;
    Transaction2.SIGHASH_OUTPUT_MASK = 3;
    Transaction2.SIGHASH_INPUT_MASK = 128;
    Transaction2.ADVANCED_TRANSACTION_MARKER = 0;
    Transaction2.ADVANCED_TRANSACTION_FLAG = 1;
  }
});

// node_modules/bitcoinjs-lib/src/block.js
var require_block = __commonJS({
  "node_modules/bitcoinjs-lib/src/block.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Block = void 0;
    var bufferutils_1 = require_bufferutils();
    var bcrypto = require_crypto();
    var merkle_1 = require_merkle();
    var transaction_1 = require_transaction();
    var types = require_types();
    var { typeforce } = types;
    var errorMerkleNoTxes = new TypeError(
      "Cannot compute merkle root for zero transactions"
    );
    var errorWitnessNotSegwit = new TypeError(
      "Cannot compute witness commit for non-segwit block"
    );
    var Block = class _Block {
      constructor() {
        this.version = 1;
        this.prevHash = void 0;
        this.merkleRoot = void 0;
        this.timestamp = 0;
        this.witnessCommit = void 0;
        this.bits = 0;
        this.nonce = 0;
        this.transactions = void 0;
      }
      static fromBuffer(buffer) {
        if (buffer.length < 80) throw new Error("Buffer too small (< 80 bytes)");
        const bufferReader = new bufferutils_1.BufferReader(buffer);
        const block = new _Block();
        block.version = bufferReader.readInt32();
        block.prevHash = bufferReader.readSlice(32);
        block.merkleRoot = bufferReader.readSlice(32);
        block.timestamp = bufferReader.readUInt32();
        block.bits = bufferReader.readUInt32();
        block.nonce = bufferReader.readUInt32();
        if (buffer.length === 80) return block;
        const readTransaction = () => {
          const tx = transaction_1.Transaction.fromBuffer(
            bufferReader.buffer.slice(bufferReader.offset),
            true
          );
          bufferReader.offset += tx.byteLength();
          return tx;
        };
        const nTransactions = bufferReader.readVarInt();
        block.transactions = [];
        for (let i = 0; i < nTransactions; ++i) {
          const tx = readTransaction();
          block.transactions.push(tx);
        }
        const witnessCommit = block.getWitnessCommit();
        if (witnessCommit) block.witnessCommit = witnessCommit;
        return block;
      }
      static fromHex(hex) {
        return _Block.fromBuffer(Buffer.from(hex, "hex"));
      }
      static calculateTarget(bits) {
        const exponent = ((bits & 4278190080) >> 24) - 3;
        const mantissa = bits & 8388607;
        const target = Buffer.alloc(32, 0);
        target.writeUIntBE(mantissa, 29 - exponent, 3);
        return target;
      }
      static calculateMerkleRoot(transactions, forWitness) {
        typeforce([{ getHash: types.Function }], transactions);
        if (transactions.length === 0) throw errorMerkleNoTxes;
        if (forWitness && !txesHaveWitnessCommit(transactions))
          throw errorWitnessNotSegwit;
        const hashes = transactions.map(
          (transaction) => transaction.getHash(forWitness)
        );
        const rootHash = (0, merkle_1.fastMerkleRoot)(hashes, bcrypto.hash256);
        return forWitness ? bcrypto.hash256(
          Buffer.concat([rootHash, transactions[0].ins[0].witness[0]])
        ) : rootHash;
      }
      getWitnessCommit() {
        if (!txesHaveWitnessCommit(this.transactions)) return null;
        const witnessCommits = this.transactions[0].outs.filter(
          (out) => out.script.slice(0, 6).equals(Buffer.from("6a24aa21a9ed", "hex"))
        ).map((out) => out.script.slice(6, 38));
        if (witnessCommits.length === 0) return null;
        const result = witnessCommits[witnessCommits.length - 1];
        if (!(result instanceof Buffer && result.length === 32)) return null;
        return result;
      }
      hasWitnessCommit() {
        if (this.witnessCommit instanceof Buffer && this.witnessCommit.length === 32)
          return true;
        if (this.getWitnessCommit() !== null) return true;
        return false;
      }
      hasWitness() {
        return anyTxHasWitness(this.transactions);
      }
      weight() {
        const base2 = this.byteLength(false, false);
        const total = this.byteLength(false, true);
        return base2 * 3 + total;
      }
      byteLength(headersOnly, allowWitness = true) {
        if (headersOnly || !this.transactions) return 80;
        return 80 + bufferutils_1.varuint.encodingLength(this.transactions.length) + this.transactions.reduce((a, x) => a + x.byteLength(allowWitness), 0);
      }
      getHash() {
        return bcrypto.hash256(this.toBuffer(true));
      }
      getId() {
        return (0, bufferutils_1.reverseBuffer)(this.getHash()).toString("hex");
      }
      getUTCDate() {
        const date = /* @__PURE__ */ new Date(0);
        date.setUTCSeconds(this.timestamp);
        return date;
      }
      // TODO: buffer, offset compatibility
      toBuffer(headersOnly) {
        const buffer = Buffer.allocUnsafe(this.byteLength(headersOnly));
        const bufferWriter = new bufferutils_1.BufferWriter(buffer);
        bufferWriter.writeInt32(this.version);
        bufferWriter.writeSlice(this.prevHash);
        bufferWriter.writeSlice(this.merkleRoot);
        bufferWriter.writeUInt32(this.timestamp);
        bufferWriter.writeUInt32(this.bits);
        bufferWriter.writeUInt32(this.nonce);
        if (headersOnly || !this.transactions) return buffer;
        bufferutils_1.varuint.encode(
          this.transactions.length,
          buffer,
          bufferWriter.offset
        );
        bufferWriter.offset += bufferutils_1.varuint.encode.bytes;
        this.transactions.forEach((tx) => {
          const txSize = tx.byteLength();
          tx.toBuffer(buffer, bufferWriter.offset);
          bufferWriter.offset += txSize;
        });
        return buffer;
      }
      toHex(headersOnly) {
        return this.toBuffer(headersOnly).toString("hex");
      }
      checkTxRoots() {
        const hasWitnessCommit = this.hasWitnessCommit();
        if (!hasWitnessCommit && this.hasWitness()) return false;
        return this.__checkMerkleRoot() && (hasWitnessCommit ? this.__checkWitnessCommit() : true);
      }
      checkProofOfWork() {
        const hash = (0, bufferutils_1.reverseBuffer)(this.getHash());
        const target = _Block.calculateTarget(this.bits);
        return hash.compare(target) <= 0;
      }
      __checkMerkleRoot() {
        if (!this.transactions) throw errorMerkleNoTxes;
        const actualMerkleRoot = _Block.calculateMerkleRoot(this.transactions);
        return this.merkleRoot.compare(actualMerkleRoot) === 0;
      }
      __checkWitnessCommit() {
        if (!this.transactions) throw errorMerkleNoTxes;
        if (!this.hasWitnessCommit()) throw errorWitnessNotSegwit;
        const actualWitnessCommit = _Block.calculateMerkleRoot(
          this.transactions,
          true
        );
        return this.witnessCommit.compare(actualWitnessCommit) === 0;
      }
    };
    exports2.Block = Block;
    function txesHaveWitnessCommit(transactions) {
      return transactions instanceof Array && transactions[0] && transactions[0].ins && transactions[0].ins instanceof Array && transactions[0].ins[0] && transactions[0].ins[0].witness && transactions[0].ins[0].witness instanceof Array && transactions[0].ins[0].witness.length > 0;
    }
    function anyTxHasWitness(transactions) {
      return transactions instanceof Array && transactions.some(
        (tx) => typeof tx === "object" && tx.ins instanceof Array && tx.ins.some(
          (input) => typeof input === "object" && input.witness instanceof Array && input.witness.length > 0
        )
      );
    }
  }
});

// node_modules/bip174/src/lib/typeFields.js
var require_typeFields = __commonJS({
  "node_modules/bip174/src/lib/typeFields.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var GlobalTypes;
    (function(GlobalTypes2) {
      GlobalTypes2[GlobalTypes2["UNSIGNED_TX"] = 0] = "UNSIGNED_TX";
      GlobalTypes2[GlobalTypes2["GLOBAL_XPUB"] = 1] = "GLOBAL_XPUB";
    })(GlobalTypes = exports2.GlobalTypes || (exports2.GlobalTypes = {}));
    exports2.GLOBAL_TYPE_NAMES = ["unsignedTx", "globalXpub"];
    var InputTypes;
    (function(InputTypes2) {
      InputTypes2[InputTypes2["NON_WITNESS_UTXO"] = 0] = "NON_WITNESS_UTXO";
      InputTypes2[InputTypes2["WITNESS_UTXO"] = 1] = "WITNESS_UTXO";
      InputTypes2[InputTypes2["PARTIAL_SIG"] = 2] = "PARTIAL_SIG";
      InputTypes2[InputTypes2["SIGHASH_TYPE"] = 3] = "SIGHASH_TYPE";
      InputTypes2[InputTypes2["REDEEM_SCRIPT"] = 4] = "REDEEM_SCRIPT";
      InputTypes2[InputTypes2["WITNESS_SCRIPT"] = 5] = "WITNESS_SCRIPT";
      InputTypes2[InputTypes2["BIP32_DERIVATION"] = 6] = "BIP32_DERIVATION";
      InputTypes2[InputTypes2["FINAL_SCRIPTSIG"] = 7] = "FINAL_SCRIPTSIG";
      InputTypes2[InputTypes2["FINAL_SCRIPTWITNESS"] = 8] = "FINAL_SCRIPTWITNESS";
      InputTypes2[InputTypes2["POR_COMMITMENT"] = 9] = "POR_COMMITMENT";
      InputTypes2[InputTypes2["TAP_KEY_SIG"] = 19] = "TAP_KEY_SIG";
      InputTypes2[InputTypes2["TAP_SCRIPT_SIG"] = 20] = "TAP_SCRIPT_SIG";
      InputTypes2[InputTypes2["TAP_LEAF_SCRIPT"] = 21] = "TAP_LEAF_SCRIPT";
      InputTypes2[InputTypes2["TAP_BIP32_DERIVATION"] = 22] = "TAP_BIP32_DERIVATION";
      InputTypes2[InputTypes2["TAP_INTERNAL_KEY"] = 23] = "TAP_INTERNAL_KEY";
      InputTypes2[InputTypes2["TAP_MERKLE_ROOT"] = 24] = "TAP_MERKLE_ROOT";
    })(InputTypes = exports2.InputTypes || (exports2.InputTypes = {}));
    exports2.INPUT_TYPE_NAMES = [
      "nonWitnessUtxo",
      "witnessUtxo",
      "partialSig",
      "sighashType",
      "redeemScript",
      "witnessScript",
      "bip32Derivation",
      "finalScriptSig",
      "finalScriptWitness",
      "porCommitment",
      "tapKeySig",
      "tapScriptSig",
      "tapLeafScript",
      "tapBip32Derivation",
      "tapInternalKey",
      "tapMerkleRoot"
    ];
    var OutputTypes;
    (function(OutputTypes2) {
      OutputTypes2[OutputTypes2["REDEEM_SCRIPT"] = 0] = "REDEEM_SCRIPT";
      OutputTypes2[OutputTypes2["WITNESS_SCRIPT"] = 1] = "WITNESS_SCRIPT";
      OutputTypes2[OutputTypes2["BIP32_DERIVATION"] = 2] = "BIP32_DERIVATION";
      OutputTypes2[OutputTypes2["TAP_INTERNAL_KEY"] = 5] = "TAP_INTERNAL_KEY";
      OutputTypes2[OutputTypes2["TAP_TREE"] = 6] = "TAP_TREE";
      OutputTypes2[OutputTypes2["TAP_BIP32_DERIVATION"] = 7] = "TAP_BIP32_DERIVATION";
    })(OutputTypes = exports2.OutputTypes || (exports2.OutputTypes = {}));
    exports2.OUTPUT_TYPE_NAMES = [
      "redeemScript",
      "witnessScript",
      "bip32Derivation",
      "tapInternalKey",
      "tapTree",
      "tapBip32Derivation"
    ];
  }
});

// node_modules/bip174/src/lib/converter/global/globalXpub.js
var require_globalXpub = __commonJS({
  "node_modules/bip174/src/lib/converter/global/globalXpub.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    var range = (n) => [...Array(n).keys()];
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.GlobalTypes.GLOBAL_XPUB) {
        throw new Error(
          "Decode Error: could not decode globalXpub with key 0x" + keyVal.key.toString("hex")
        );
      }
      if (keyVal.key.length !== 79 || ![2, 3].includes(keyVal.key[46])) {
        throw new Error(
          "Decode Error: globalXpub has invalid extended pubkey in key 0x" + keyVal.key.toString("hex")
        );
      }
      if (keyVal.value.length / 4 % 1 !== 0) {
        throw new Error(
          "Decode Error: Global GLOBAL_XPUB value length should be multiple of 4"
        );
      }
      const extendedPubkey = keyVal.key.slice(1);
      const data = {
        masterFingerprint: keyVal.value.slice(0, 4),
        extendedPubkey,
        path: "m"
      };
      for (const i of range(keyVal.value.length / 4 - 1)) {
        const val = keyVal.value.readUInt32LE(i * 4 + 4);
        const isHard = !!(val & 2147483648);
        const idx = val & 2147483647;
        data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
      }
      return data;
    }
    exports2.decode = decode2;
    function encode2(data) {
      const head = Buffer.from([typeFields_1.GlobalTypes.GLOBAL_XPUB]);
      const key = Buffer.concat([head, data.extendedPubkey]);
      const splitPath = data.path.split("/");
      const value = Buffer.allocUnsafe(splitPath.length * 4);
      data.masterFingerprint.copy(value, 0);
      let offset = 4;
      splitPath.slice(1).forEach((level) => {
        const isHard = level.slice(-1) === "'";
        let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
        if (isHard) num += 2147483648;
        value.writeUInt32LE(num, offset);
        offset += 4;
      });
      return {
        key,
        value
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ masterFingerprint: Buffer; extendedPubkey: Buffer; path: string; }";
    function check(data) {
      const epk = data.extendedPubkey;
      const mfp = data.masterFingerprint;
      const p = data.path;
      return Buffer.isBuffer(epk) && epk.length === 78 && [2, 3].indexOf(epk[45]) > -1 && Buffer.isBuffer(mfp) && mfp.length === 4 && typeof p === "string" && !!p.match(/^m(\/\d+'?)*$/);
    }
    exports2.check = check;
    function canAddToArray(array, item, dupeSet) {
      const dupeString = item.extendedPubkey.toString("hex");
      if (dupeSet.has(dupeString)) return false;
      dupeSet.add(dupeString);
      return array.filter((v) => v.extendedPubkey.equals(item.extendedPubkey)).length === 0;
    }
    exports2.canAddToArray = canAddToArray;
  }
});

// node_modules/bip174/src/lib/converter/global/unsignedTx.js
var require_unsignedTx = __commonJS({
  "node_modules/bip174/src/lib/converter/global/unsignedTx.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function encode2(data) {
      return {
        key: Buffer.from([typeFields_1.GlobalTypes.UNSIGNED_TX]),
        value: data.toBuffer()
      };
    }
    exports2.encode = encode2;
  }
});

// node_modules/bip174/src/lib/converter/input/finalScriptSig.js
var require_finalScriptSig = __commonJS({
  "node_modules/bip174/src/lib/converter/input/finalScriptSig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTSIG) {
        throw new Error(
          "Decode Error: could not decode finalScriptSig with key 0x" + keyVal.key.toString("hex")
        );
      }
      return keyVal.value;
    }
    exports2.decode = decode2;
    function encode2(data) {
      const key = Buffer.from([typeFields_1.InputTypes.FINAL_SCRIPTSIG]);
      return {
        key,
        value: data
      };
    }
    exports2.encode = encode2;
    exports2.expected = "Buffer";
    function check(data) {
      return Buffer.isBuffer(data);
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.finalScriptSig === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/finalScriptWitness.js
var require_finalScriptWitness = __commonJS({
  "node_modules/bip174/src/lib/converter/input/finalScriptWitness.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTWITNESS) {
        throw new Error(
          "Decode Error: could not decode finalScriptWitness with key 0x" + keyVal.key.toString("hex")
        );
      }
      return keyVal.value;
    }
    exports2.decode = decode2;
    function encode2(data) {
      const key = Buffer.from([typeFields_1.InputTypes.FINAL_SCRIPTWITNESS]);
      return {
        key,
        value: data
      };
    }
    exports2.encode = encode2;
    exports2.expected = "Buffer";
    function check(data) {
      return Buffer.isBuffer(data);
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.finalScriptWitness === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/nonWitnessUtxo.js
var require_nonWitnessUtxo = __commonJS({
  "node_modules/bip174/src/lib/converter/input/nonWitnessUtxo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.NON_WITNESS_UTXO) {
        throw new Error(
          "Decode Error: could not decode nonWitnessUtxo with key 0x" + keyVal.key.toString("hex")
        );
      }
      return keyVal.value;
    }
    exports2.decode = decode2;
    function encode2(data) {
      return {
        key: Buffer.from([typeFields_1.InputTypes.NON_WITNESS_UTXO]),
        value: data
      };
    }
    exports2.encode = encode2;
    exports2.expected = "Buffer";
    function check(data) {
      return Buffer.isBuffer(data);
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.nonWitnessUtxo === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/partialSig.js
var require_partialSig = __commonJS({
  "node_modules/bip174/src/lib/converter/input/partialSig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.PARTIAL_SIG) {
        throw new Error(
          "Decode Error: could not decode partialSig with key 0x" + keyVal.key.toString("hex")
        );
      }
      if (!(keyVal.key.length === 34 || keyVal.key.length === 66) || ![2, 3, 4].includes(keyVal.key[1])) {
        throw new Error(
          "Decode Error: partialSig has invalid pubkey in key 0x" + keyVal.key.toString("hex")
        );
      }
      const pubkey = keyVal.key.slice(1);
      return {
        pubkey,
        signature: keyVal.value
      };
    }
    exports2.decode = decode2;
    function encode2(pSig) {
      const head = Buffer.from([typeFields_1.InputTypes.PARTIAL_SIG]);
      return {
        key: Buffer.concat([head, pSig.pubkey]),
        value: pSig.signature
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ pubkey: Buffer; signature: Buffer; }";
    function check(data) {
      return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.signature) && [33, 65].includes(data.pubkey.length) && [2, 3, 4].includes(data.pubkey[0]) && isDerSigWithSighash(data.signature);
    }
    exports2.check = check;
    function isDerSigWithSighash(buf) {
      if (!Buffer.isBuffer(buf) || buf.length < 9) return false;
      if (buf[0] !== 48) return false;
      if (buf.length !== buf[1] + 3) return false;
      if (buf[2] !== 2) return false;
      const rLen = buf[3];
      if (rLen > 33 || rLen < 1) return false;
      if (buf[3 + rLen + 1] !== 2) return false;
      const sLen = buf[3 + rLen + 2];
      if (sLen > 33 || sLen < 1) return false;
      if (buf.length !== 3 + rLen + 2 + sLen + 2) return false;
      return true;
    }
    function canAddToArray(array, item, dupeSet) {
      const dupeString = item.pubkey.toString("hex");
      if (dupeSet.has(dupeString)) return false;
      dupeSet.add(dupeString);
      return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
    }
    exports2.canAddToArray = canAddToArray;
  }
});

// node_modules/bip174/src/lib/converter/input/porCommitment.js
var require_porCommitment = __commonJS({
  "node_modules/bip174/src/lib/converter/input/porCommitment.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.POR_COMMITMENT) {
        throw new Error(
          "Decode Error: could not decode porCommitment with key 0x" + keyVal.key.toString("hex")
        );
      }
      return keyVal.value.toString("utf8");
    }
    exports2.decode = decode2;
    function encode2(data) {
      const key = Buffer.from([typeFields_1.InputTypes.POR_COMMITMENT]);
      return {
        key,
        value: Buffer.from(data, "utf8")
      };
    }
    exports2.encode = encode2;
    exports2.expected = "string";
    function check(data) {
      return typeof data === "string";
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.porCommitment === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/sighashType.js
var require_sighashType = __commonJS({
  "node_modules/bip174/src/lib/converter/input/sighashType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.SIGHASH_TYPE) {
        throw new Error(
          "Decode Error: could not decode sighashType with key 0x" + keyVal.key.toString("hex")
        );
      }
      return keyVal.value.readUInt32LE(0);
    }
    exports2.decode = decode2;
    function encode2(data) {
      const key = Buffer.from([typeFields_1.InputTypes.SIGHASH_TYPE]);
      const value = Buffer.allocUnsafe(4);
      value.writeUInt32LE(data, 0);
      return {
        key,
        value
      };
    }
    exports2.encode = encode2;
    exports2.expected = "number";
    function check(data) {
      return typeof data === "number";
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.sighashType === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/tapKeySig.js
var require_tapKeySig = __commonJS({
  "node_modules/bip174/src/lib/converter/input/tapKeySig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_KEY_SIG || keyVal.key.length !== 1) {
        throw new Error(
          "Decode Error: could not decode tapKeySig with key 0x" + keyVal.key.toString("hex")
        );
      }
      if (!check(keyVal.value)) {
        throw new Error(
          "Decode Error: tapKeySig not a valid 64-65-byte BIP340 signature"
        );
      }
      return keyVal.value;
    }
    exports2.decode = decode2;
    function encode2(value) {
      const key = Buffer.from([typeFields_1.InputTypes.TAP_KEY_SIG]);
      return { key, value };
    }
    exports2.encode = encode2;
    exports2.expected = "Buffer";
    function check(data) {
      return Buffer.isBuffer(data) && (data.length === 64 || data.length === 65);
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.tapKeySig === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/tapLeafScript.js
var require_tapLeafScript = __commonJS({
  "node_modules/bip174/src/lib/converter/input/tapLeafScript.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_LEAF_SCRIPT) {
        throw new Error(
          "Decode Error: could not decode tapLeafScript with key 0x" + keyVal.key.toString("hex")
        );
      }
      if ((keyVal.key.length - 2) % 32 !== 0) {
        throw new Error(
          "Decode Error: tapLeafScript has invalid control block in key 0x" + keyVal.key.toString("hex")
        );
      }
      const leafVersion = keyVal.value[keyVal.value.length - 1];
      if ((keyVal.key[1] & 254) !== leafVersion) {
        throw new Error(
          "Decode Error: tapLeafScript bad leaf version in key 0x" + keyVal.key.toString("hex")
        );
      }
      const script2 = keyVal.value.slice(0, -1);
      const controlBlock = keyVal.key.slice(1);
      return { controlBlock, script: script2, leafVersion };
    }
    exports2.decode = decode2;
    function encode2(tScript) {
      const head = Buffer.from([typeFields_1.InputTypes.TAP_LEAF_SCRIPT]);
      const verBuf = Buffer.from([tScript.leafVersion]);
      return {
        key: Buffer.concat([head, tScript.controlBlock]),
        value: Buffer.concat([tScript.script, verBuf])
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ controlBlock: Buffer; leafVersion: number, script: Buffer; }";
    function check(data) {
      return Buffer.isBuffer(data.controlBlock) && (data.controlBlock.length - 1) % 32 === 0 && (data.controlBlock[0] & 254) === data.leafVersion && Buffer.isBuffer(data.script);
    }
    exports2.check = check;
    function canAddToArray(array, item, dupeSet) {
      const dupeString = item.controlBlock.toString("hex");
      if (dupeSet.has(dupeString)) return false;
      dupeSet.add(dupeString);
      return array.filter((v) => v.controlBlock.equals(item.controlBlock)).length === 0;
    }
    exports2.canAddToArray = canAddToArray;
  }
});

// node_modules/bip174/src/lib/converter/input/tapMerkleRoot.js
var require_tapMerkleRoot = __commonJS({
  "node_modules/bip174/src/lib/converter/input/tapMerkleRoot.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_MERKLE_ROOT || keyVal.key.length !== 1) {
        throw new Error(
          "Decode Error: could not decode tapMerkleRoot with key 0x" + keyVal.key.toString("hex")
        );
      }
      if (!check(keyVal.value)) {
        throw new Error("Decode Error: tapMerkleRoot not a 32-byte hash");
      }
      return keyVal.value;
    }
    exports2.decode = decode2;
    function encode2(value) {
      const key = Buffer.from([typeFields_1.InputTypes.TAP_MERKLE_ROOT]);
      return { key, value };
    }
    exports2.encode = encode2;
    exports2.expected = "Buffer";
    function check(data) {
      return Buffer.isBuffer(data) && data.length === 32;
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.tapMerkleRoot === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/input/tapScriptSig.js
var require_tapScriptSig = __commonJS({
  "node_modules/bip174/src/lib/converter/input/tapScriptSig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_SCRIPT_SIG) {
        throw new Error(
          "Decode Error: could not decode tapScriptSig with key 0x" + keyVal.key.toString("hex")
        );
      }
      if (keyVal.key.length !== 65) {
        throw new Error(
          "Decode Error: tapScriptSig has invalid key 0x" + keyVal.key.toString("hex")
        );
      }
      if (keyVal.value.length !== 64 && keyVal.value.length !== 65) {
        throw new Error(
          "Decode Error: tapScriptSig has invalid signature in key 0x" + keyVal.key.toString("hex")
        );
      }
      const pubkey = keyVal.key.slice(1, 33);
      const leafHash = keyVal.key.slice(33);
      return {
        pubkey,
        leafHash,
        signature: keyVal.value
      };
    }
    exports2.decode = decode2;
    function encode2(tSig) {
      const head = Buffer.from([typeFields_1.InputTypes.TAP_SCRIPT_SIG]);
      return {
        key: Buffer.concat([head, tSig.pubkey, tSig.leafHash]),
        value: tSig.signature
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ pubkey: Buffer; leafHash: Buffer; signature: Buffer; }";
    function check(data) {
      return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.leafHash) && Buffer.isBuffer(data.signature) && data.pubkey.length === 32 && data.leafHash.length === 32 && (data.signature.length === 64 || data.signature.length === 65);
    }
    exports2.check = check;
    function canAddToArray(array, item, dupeSet) {
      const dupeString = item.pubkey.toString("hex") + item.leafHash.toString("hex");
      if (dupeSet.has(dupeString)) return false;
      dupeSet.add(dupeString);
      return array.filter(
        (v) => v.pubkey.equals(item.pubkey) && v.leafHash.equals(item.leafHash)
      ).length === 0;
    }
    exports2.canAddToArray = canAddToArray;
  }
});

// node_modules/bip174/src/lib/converter/varint.js
var require_varint = __commonJS({
  "node_modules/bip174/src/lib/converter/varint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var MAX_SAFE_INTEGER = 9007199254740991;
    function checkUInt53(n) {
      if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
        throw new RangeError("value out of range");
    }
    function encode2(_number, buffer, offset) {
      checkUInt53(_number);
      if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(_number));
      if (!Buffer.isBuffer(buffer))
        throw new TypeError("buffer must be a Buffer instance");
      if (!offset) offset = 0;
      if (_number < 253) {
        buffer.writeUInt8(_number, offset);
        Object.assign(encode2, { bytes: 1 });
      } else if (_number <= 65535) {
        buffer.writeUInt8(253, offset);
        buffer.writeUInt16LE(_number, offset + 1);
        Object.assign(encode2, { bytes: 3 });
      } else if (_number <= 4294967295) {
        buffer.writeUInt8(254, offset);
        buffer.writeUInt32LE(_number, offset + 1);
        Object.assign(encode2, { bytes: 5 });
      } else {
        buffer.writeUInt8(255, offset);
        buffer.writeUInt32LE(_number >>> 0, offset + 1);
        buffer.writeUInt32LE(_number / 4294967296 | 0, offset + 5);
        Object.assign(encode2, { bytes: 9 });
      }
      return buffer;
    }
    exports2.encode = encode2;
    function decode2(buffer, offset) {
      if (!Buffer.isBuffer(buffer))
        throw new TypeError("buffer must be a Buffer instance");
      if (!offset) offset = 0;
      const first = buffer.readUInt8(offset);
      if (first < 253) {
        Object.assign(decode2, { bytes: 1 });
        return first;
      } else if (first === 253) {
        Object.assign(decode2, { bytes: 3 });
        return buffer.readUInt16LE(offset + 1);
      } else if (first === 254) {
        Object.assign(decode2, { bytes: 5 });
        return buffer.readUInt32LE(offset + 1);
      } else {
        Object.assign(decode2, { bytes: 9 });
        const lo = buffer.readUInt32LE(offset + 1);
        const hi = buffer.readUInt32LE(offset + 5);
        const _number = hi * 4294967296 + lo;
        checkUInt53(_number);
        return _number;
      }
    }
    exports2.decode = decode2;
    function encodingLength(_number) {
      checkUInt53(_number);
      return _number < 253 ? 1 : _number <= 65535 ? 3 : _number <= 4294967295 ? 5 : 9;
    }
    exports2.encodingLength = encodingLength;
  }
});

// node_modules/bip174/src/lib/converter/tools.js
var require_tools = __commonJS({
  "node_modules/bip174/src/lib/converter/tools.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var varuint = require_varint();
    exports2.range = (n) => [...Array(n).keys()];
    function reverseBuffer(buffer) {
      if (buffer.length < 1) return buffer;
      let j = buffer.length - 1;
      let tmp = 0;
      for (let i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
      }
      return buffer;
    }
    exports2.reverseBuffer = reverseBuffer;
    function keyValsToBuffer(keyVals) {
      const buffers = keyVals.map(keyValToBuffer);
      buffers.push(Buffer.from([0]));
      return Buffer.concat(buffers);
    }
    exports2.keyValsToBuffer = keyValsToBuffer;
    function keyValToBuffer(keyVal) {
      const keyLen = keyVal.key.length;
      const valLen = keyVal.value.length;
      const keyVarIntLen = varuint.encodingLength(keyLen);
      const valVarIntLen = varuint.encodingLength(valLen);
      const buffer = Buffer.allocUnsafe(
        keyVarIntLen + keyLen + valVarIntLen + valLen
      );
      varuint.encode(keyLen, buffer, 0);
      keyVal.key.copy(buffer, keyVarIntLen);
      varuint.encode(valLen, buffer, keyVarIntLen + keyLen);
      keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);
      return buffer;
    }
    exports2.keyValToBuffer = keyValToBuffer;
    function verifuint(value, max) {
      if (typeof value !== "number")
        throw new Error("cannot write a non-number as a number");
      if (value < 0)
        throw new Error("specified a negative value for writing an unsigned value");
      if (value > max) throw new Error("RangeError: value out of range");
      if (Math.floor(value) !== value)
        throw new Error("value has a fractional component");
    }
    function readUInt64LE(buffer, offset) {
      const a = buffer.readUInt32LE(offset);
      let b = buffer.readUInt32LE(offset + 4);
      b *= 4294967296;
      verifuint(b + a, 9007199254740991);
      return b + a;
    }
    exports2.readUInt64LE = readUInt64LE;
    function writeUInt64LE(buffer, value, offset) {
      verifuint(value, 9007199254740991);
      buffer.writeInt32LE(value & -1, offset);
      buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
      return offset + 8;
    }
    exports2.writeUInt64LE = writeUInt64LE;
  }
});

// node_modules/bip174/src/lib/converter/input/witnessUtxo.js
var require_witnessUtxo = __commonJS({
  "node_modules/bip174/src/lib/converter/input/witnessUtxo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    var tools_1 = require_tools();
    var varuint = require_varint();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.InputTypes.WITNESS_UTXO) {
        throw new Error(
          "Decode Error: could not decode witnessUtxo with key 0x" + keyVal.key.toString("hex")
        );
      }
      const value = tools_1.readUInt64LE(keyVal.value, 0);
      let _offset = 8;
      const scriptLen = varuint.decode(keyVal.value, _offset);
      _offset += varuint.encodingLength(scriptLen);
      const script2 = keyVal.value.slice(_offset);
      if (script2.length !== scriptLen) {
        throw new Error("Decode Error: WITNESS_UTXO script is not proper length");
      }
      return {
        script: script2,
        value
      };
    }
    exports2.decode = decode2;
    function encode2(data) {
      const { script: script2, value } = data;
      const varintLen = varuint.encodingLength(script2.length);
      const result = Buffer.allocUnsafe(8 + varintLen + script2.length);
      tools_1.writeUInt64LE(result, value, 0);
      varuint.encode(script2.length, result, 8);
      script2.copy(result, 8 + varintLen);
      return {
        key: Buffer.from([typeFields_1.InputTypes.WITNESS_UTXO]),
        value: result
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ script: Buffer; value: number; }";
    function check(data) {
      return Buffer.isBuffer(data.script) && typeof data.value === "number";
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.witnessUtxo === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/output/tapTree.js
var require_tapTree = __commonJS({
  "node_modules/bip174/src/lib/converter/output/tapTree.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    var varuint = require_varint();
    function decode2(keyVal) {
      if (keyVal.key[0] !== typeFields_1.OutputTypes.TAP_TREE || keyVal.key.length !== 1) {
        throw new Error(
          "Decode Error: could not decode tapTree with key 0x" + keyVal.key.toString("hex")
        );
      }
      let _offset = 0;
      const data = [];
      while (_offset < keyVal.value.length) {
        const depth = keyVal.value[_offset++];
        const leafVersion = keyVal.value[_offset++];
        const scriptLen = varuint.decode(keyVal.value, _offset);
        _offset += varuint.encodingLength(scriptLen);
        data.push({
          depth,
          leafVersion,
          script: keyVal.value.slice(_offset, _offset + scriptLen)
        });
        _offset += scriptLen;
      }
      return { leaves: data };
    }
    exports2.decode = decode2;
    function encode2(tree) {
      const key = Buffer.from([typeFields_1.OutputTypes.TAP_TREE]);
      const bufs = [].concat(
        ...tree.leaves.map((tapLeaf) => [
          Buffer.of(tapLeaf.depth, tapLeaf.leafVersion),
          varuint.encode(tapLeaf.script.length),
          tapLeaf.script
        ])
      );
      return {
        key,
        value: Buffer.concat(bufs)
      };
    }
    exports2.encode = encode2;
    exports2.expected = "{ leaves: [{ depth: number; leafVersion: number, script: Buffer; }] }";
    function check(data) {
      return Array.isArray(data.leaves) && data.leaves.every(
        (tapLeaf) => tapLeaf.depth >= 0 && tapLeaf.depth <= 128 && (tapLeaf.leafVersion & 254) === tapLeaf.leafVersion && Buffer.isBuffer(tapLeaf.script)
      );
    }
    exports2.check = check;
    function canAdd(currentData, newData) {
      return !!currentData && !!newData && currentData.tapTree === void 0;
    }
    exports2.canAdd = canAdd;
  }
});

// node_modules/bip174/src/lib/converter/shared/bip32Derivation.js
var require_bip32Derivation = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/bip32Derivation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var range = (n) => [...Array(n).keys()];
    var isValidDERKey = (pubkey) => pubkey.length === 33 && [2, 3].includes(pubkey[0]) || pubkey.length === 65 && 4 === pubkey[0];
    function makeConverter(TYPE_BYTE, isValidPubkey = isValidDERKey) {
      function decode2(keyVal) {
        if (keyVal.key[0] !== TYPE_BYTE) {
          throw new Error(
            "Decode Error: could not decode bip32Derivation with key 0x" + keyVal.key.toString("hex")
          );
        }
        const pubkey = keyVal.key.slice(1);
        if (!isValidPubkey(pubkey)) {
          throw new Error(
            "Decode Error: bip32Derivation has invalid pubkey in key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.value.length / 4 % 1 !== 0) {
          throw new Error(
            "Decode Error: Input BIP32_DERIVATION value length should be multiple of 4"
          );
        }
        const data = {
          masterFingerprint: keyVal.value.slice(0, 4),
          pubkey,
          path: "m"
        };
        for (const i of range(keyVal.value.length / 4 - 1)) {
          const val = keyVal.value.readUInt32LE(i * 4 + 4);
          const isHard = !!(val & 2147483648);
          const idx = val & 2147483647;
          data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
        }
        return data;
      }
      function encode2(data) {
        const head = Buffer.from([TYPE_BYTE]);
        const key = Buffer.concat([head, data.pubkey]);
        const splitPath = data.path.split("/");
        const value = Buffer.allocUnsafe(splitPath.length * 4);
        data.masterFingerprint.copy(value, 0);
        let offset = 4;
        splitPath.slice(1).forEach((level) => {
          const isHard = level.slice(-1) === "'";
          let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
          if (isHard) num += 2147483648;
          value.writeUInt32LE(num, offset);
          offset += 4;
        });
        return {
          key,
          value
        };
      }
      const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }";
      function check(data) {
        return Buffer.isBuffer(data.pubkey) && Buffer.isBuffer(data.masterFingerprint) && typeof data.path === "string" && isValidPubkey(data.pubkey) && data.masterFingerprint.length === 4;
      }
      function canAddToArray(array, item, dupeSet) {
        const dupeString = item.pubkey.toString("hex");
        if (dupeSet.has(dupeString)) return false;
        dupeSet.add(dupeString);
        return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
      }
      return {
        decode: decode2,
        encode: encode2,
        check,
        expected,
        canAddToArray
      };
    }
    exports2.makeConverter = makeConverter;
  }
});

// node_modules/bip174/src/lib/converter/shared/checkPubkey.js
var require_checkPubkey = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/checkPubkey.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function makeChecker(pubkeyTypes) {
      return checkPubkey;
      function checkPubkey(keyVal) {
        let pubkey;
        if (pubkeyTypes.includes(keyVal.key[0])) {
          pubkey = keyVal.key.slice(1);
          if (!(pubkey.length === 33 || pubkey.length === 65) || ![2, 3, 4].includes(pubkey[0])) {
            throw new Error(
              "Format Error: invalid pubkey in key 0x" + keyVal.key.toString("hex")
            );
          }
        }
        return pubkey;
      }
    }
    exports2.makeChecker = makeChecker;
  }
});

// node_modules/bip174/src/lib/converter/shared/redeemScript.js
var require_redeemScript = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/redeemScript.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function makeConverter(TYPE_BYTE) {
      function decode2(keyVal) {
        if (keyVal.key[0] !== TYPE_BYTE) {
          throw new Error(
            "Decode Error: could not decode redeemScript with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value;
      }
      function encode2(data) {
        const key = Buffer.from([TYPE_BYTE]);
        return {
          key,
          value: data
        };
      }
      const expected = "Buffer";
      function check(data) {
        return Buffer.isBuffer(data);
      }
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.redeemScript === void 0;
      }
      return {
        decode: decode2,
        encode: encode2,
        check,
        expected,
        canAdd
      };
    }
    exports2.makeConverter = makeConverter;
  }
});

// node_modules/bip174/src/lib/converter/shared/tapBip32Derivation.js
var require_tapBip32Derivation = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/tapBip32Derivation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var varuint = require_varint();
    var bip32Derivation = require_bip32Derivation();
    var isValidBIP340Key = (pubkey) => pubkey.length === 32;
    function makeConverter(TYPE_BYTE) {
      const parent = bip32Derivation.makeConverter(TYPE_BYTE, isValidBIP340Key);
      function decode2(keyVal) {
        const nHashes = varuint.decode(keyVal.value);
        const nHashesLen = varuint.encodingLength(nHashes);
        const base2 = parent.decode({
          key: keyVal.key,
          value: keyVal.value.slice(nHashesLen + nHashes * 32)
        });
        const leafHashes = new Array(nHashes);
        for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) {
          leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
        }
        return Object.assign({}, base2, { leafHashes });
      }
      function encode2(data) {
        const base2 = parent.encode(data);
        const nHashesLen = varuint.encodingLength(data.leafHashes.length);
        const nHashesBuf = Buffer.allocUnsafe(nHashesLen);
        varuint.encode(data.leafHashes.length, nHashesBuf);
        const value = Buffer.concat([nHashesBuf, ...data.leafHashes, base2.value]);
        return Object.assign({}, base2, { value });
      }
      const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; leafHashes: Buffer[]; }";
      function check(data) {
        return Array.isArray(data.leafHashes) && data.leafHashes.every(
          (leafHash) => Buffer.isBuffer(leafHash) && leafHash.length === 32
        ) && parent.check(data);
      }
      return {
        decode: decode2,
        encode: encode2,
        check,
        expected,
        canAddToArray: parent.canAddToArray
      };
    }
    exports2.makeConverter = makeConverter;
  }
});

// node_modules/bip174/src/lib/converter/shared/tapInternalKey.js
var require_tapInternalKey = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/tapInternalKey.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function makeConverter(TYPE_BYTE) {
      function decode2(keyVal) {
        if (keyVal.key[0] !== TYPE_BYTE || keyVal.key.length !== 1) {
          throw new Error(
            "Decode Error: could not decode tapInternalKey with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.value.length !== 32) {
          throw new Error(
            "Decode Error: tapInternalKey not a 32-byte x-only pubkey"
          );
        }
        return keyVal.value;
      }
      function encode2(value) {
        const key = Buffer.from([TYPE_BYTE]);
        return { key, value };
      }
      const expected = "Buffer";
      function check(data) {
        return Buffer.isBuffer(data) && data.length === 32;
      }
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.tapInternalKey === void 0;
      }
      return {
        decode: decode2,
        encode: encode2,
        check,
        expected,
        canAdd
      };
    }
    exports2.makeConverter = makeConverter;
  }
});

// node_modules/bip174/src/lib/converter/shared/witnessScript.js
var require_witnessScript = __commonJS({
  "node_modules/bip174/src/lib/converter/shared/witnessScript.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function makeConverter(TYPE_BYTE) {
      function decode2(keyVal) {
        if (keyVal.key[0] !== TYPE_BYTE) {
          throw new Error(
            "Decode Error: could not decode witnessScript with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value;
      }
      function encode2(data) {
        const key = Buffer.from([TYPE_BYTE]);
        return {
          key,
          value: data
        };
      }
      const expected = "Buffer";
      function check(data) {
        return Buffer.isBuffer(data);
      }
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.witnessScript === void 0;
      }
      return {
        decode: decode2,
        encode: encode2,
        check,
        expected,
        canAdd
      };
    }
    exports2.makeConverter = makeConverter;
  }
});

// node_modules/bip174/src/lib/converter/index.js
var require_converter = __commonJS({
  "node_modules/bip174/src/lib/converter/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var typeFields_1 = require_typeFields();
    var globalXpub = require_globalXpub();
    var unsignedTx = require_unsignedTx();
    var finalScriptSig = require_finalScriptSig();
    var finalScriptWitness = require_finalScriptWitness();
    var nonWitnessUtxo = require_nonWitnessUtxo();
    var partialSig = require_partialSig();
    var porCommitment = require_porCommitment();
    var sighashType = require_sighashType();
    var tapKeySig = require_tapKeySig();
    var tapLeafScript = require_tapLeafScript();
    var tapMerkleRoot = require_tapMerkleRoot();
    var tapScriptSig = require_tapScriptSig();
    var witnessUtxo = require_witnessUtxo();
    var tapTree = require_tapTree();
    var bip32Derivation = require_bip32Derivation();
    var checkPubkey = require_checkPubkey();
    var redeemScript = require_redeemScript();
    var tapBip32Derivation = require_tapBip32Derivation();
    var tapInternalKey = require_tapInternalKey();
    var witnessScript = require_witnessScript();
    var globals = {
      unsignedTx,
      globalXpub,
      // pass an Array of key bytes that require pubkey beside the key
      checkPubkey: checkPubkey.makeChecker([])
    };
    exports2.globals = globals;
    var inputs = {
      nonWitnessUtxo,
      partialSig,
      sighashType,
      finalScriptSig,
      finalScriptWitness,
      porCommitment,
      witnessUtxo,
      bip32Derivation: bip32Derivation.makeConverter(
        typeFields_1.InputTypes.BIP32_DERIVATION
      ),
      redeemScript: redeemScript.makeConverter(
        typeFields_1.InputTypes.REDEEM_SCRIPT
      ),
      witnessScript: witnessScript.makeConverter(
        typeFields_1.InputTypes.WITNESS_SCRIPT
      ),
      checkPubkey: checkPubkey.makeChecker([
        typeFields_1.InputTypes.PARTIAL_SIG,
        typeFields_1.InputTypes.BIP32_DERIVATION
      ]),
      tapKeySig,
      tapScriptSig,
      tapLeafScript,
      tapBip32Derivation: tapBip32Derivation.makeConverter(
        typeFields_1.InputTypes.TAP_BIP32_DERIVATION
      ),
      tapInternalKey: tapInternalKey.makeConverter(
        typeFields_1.InputTypes.TAP_INTERNAL_KEY
      ),
      tapMerkleRoot
    };
    exports2.inputs = inputs;
    var outputs = {
      bip32Derivation: bip32Derivation.makeConverter(
        typeFields_1.OutputTypes.BIP32_DERIVATION
      ),
      redeemScript: redeemScript.makeConverter(
        typeFields_1.OutputTypes.REDEEM_SCRIPT
      ),
      witnessScript: witnessScript.makeConverter(
        typeFields_1.OutputTypes.WITNESS_SCRIPT
      ),
      checkPubkey: checkPubkey.makeChecker([
        typeFields_1.OutputTypes.BIP32_DERIVATION
      ]),
      tapBip32Derivation: tapBip32Derivation.makeConverter(
        typeFields_1.OutputTypes.TAP_BIP32_DERIVATION
      ),
      tapTree,
      tapInternalKey: tapInternalKey.makeConverter(
        typeFields_1.OutputTypes.TAP_INTERNAL_KEY
      )
    };
    exports2.outputs = outputs;
  }
});

// node_modules/bip174/src/lib/parser/fromBuffer.js
var require_fromBuffer = __commonJS({
  "node_modules/bip174/src/lib/parser/fromBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var convert = require_converter();
    var tools_1 = require_tools();
    var varuint = require_varint();
    var typeFields_1 = require_typeFields();
    function psbtFromBuffer(buffer, txGetter) {
      let offset = 0;
      function varSlice() {
        const keyLen = varuint.decode(buffer, offset);
        offset += varuint.encodingLength(keyLen);
        const key = buffer.slice(offset, offset + keyLen);
        offset += keyLen;
        return key;
      }
      function readUInt32BE() {
        const num = buffer.readUInt32BE(offset);
        offset += 4;
        return num;
      }
      function readUInt8() {
        const num = buffer.readUInt8(offset);
        offset += 1;
        return num;
      }
      function getKeyValue() {
        const key = varSlice();
        const value = varSlice();
        return {
          key,
          value
        };
      }
      function checkEndOfKeyValPairs() {
        if (offset >= buffer.length) {
          throw new Error("Format Error: Unexpected End of PSBT");
        }
        const isEnd = buffer.readUInt8(offset) === 0;
        if (isEnd) {
          offset++;
        }
        return isEnd;
      }
      if (readUInt32BE() !== 1886610036) {
        throw new Error("Format Error: Invalid Magic Number");
      }
      if (readUInt8() !== 255) {
        throw new Error(
          "Format Error: Magic Number must be followed by 0xff separator"
        );
      }
      const globalMapKeyVals = [];
      const globalKeyIndex = {};
      while (!checkEndOfKeyValPairs()) {
        const keyVal = getKeyValue();
        const hexKey = keyVal.key.toString("hex");
        if (globalKeyIndex[hexKey]) {
          throw new Error(
            "Format Error: Keys must be unique for global keymap: key " + hexKey
          );
        }
        globalKeyIndex[hexKey] = 1;
        globalMapKeyVals.push(keyVal);
      }
      const unsignedTxMaps = globalMapKeyVals.filter(
        (keyVal) => keyVal.key[0] === typeFields_1.GlobalTypes.UNSIGNED_TX
      );
      if (unsignedTxMaps.length !== 1) {
        throw new Error("Format Error: Only one UNSIGNED_TX allowed");
      }
      const unsignedTx = txGetter(unsignedTxMaps[0].value);
      const { inputCount, outputCount } = unsignedTx.getInputOutputCounts();
      const inputKeyVals = [];
      const outputKeyVals = [];
      for (const index of tools_1.range(inputCount)) {
        const inputKeyIndex = {};
        const input = [];
        while (!checkEndOfKeyValPairs()) {
          const keyVal = getKeyValue();
          const hexKey = keyVal.key.toString("hex");
          if (inputKeyIndex[hexKey]) {
            throw new Error(
              "Format Error: Keys must be unique for each input: input index " + index + " key " + hexKey
            );
          }
          inputKeyIndex[hexKey] = 1;
          input.push(keyVal);
        }
        inputKeyVals.push(input);
      }
      for (const index of tools_1.range(outputCount)) {
        const outputKeyIndex = {};
        const output = [];
        while (!checkEndOfKeyValPairs()) {
          const keyVal = getKeyValue();
          const hexKey = keyVal.key.toString("hex");
          if (outputKeyIndex[hexKey]) {
            throw new Error(
              "Format Error: Keys must be unique for each output: output index " + index + " key " + hexKey
            );
          }
          outputKeyIndex[hexKey] = 1;
          output.push(keyVal);
        }
        outputKeyVals.push(output);
      }
      return psbtFromKeyVals(unsignedTx, {
        globalMapKeyVals,
        inputKeyVals,
        outputKeyVals
      });
    }
    exports2.psbtFromBuffer = psbtFromBuffer;
    function checkKeyBuffer(type, keyBuf, keyNum) {
      if (!keyBuf.equals(Buffer.from([keyNum]))) {
        throw new Error(
          `Format Error: Invalid ${type} key: ${keyBuf.toString("hex")}`
        );
      }
    }
    exports2.checkKeyBuffer = checkKeyBuffer;
    function psbtFromKeyVals(unsignedTx, { globalMapKeyVals, inputKeyVals, outputKeyVals }) {
      const globalMap = {
        unsignedTx
      };
      let txCount = 0;
      for (const keyVal of globalMapKeyVals) {
        switch (keyVal.key[0]) {
          case typeFields_1.GlobalTypes.UNSIGNED_TX:
            checkKeyBuffer(
              "global",
              keyVal.key,
              typeFields_1.GlobalTypes.UNSIGNED_TX
            );
            if (txCount > 0) {
              throw new Error("Format Error: GlobalMap has multiple UNSIGNED_TX");
            }
            txCount++;
            break;
          case typeFields_1.GlobalTypes.GLOBAL_XPUB:
            if (globalMap.globalXpub === void 0) {
              globalMap.globalXpub = [];
            }
            globalMap.globalXpub.push(convert.globals.globalXpub.decode(keyVal));
            break;
          default:
            if (!globalMap.unknownKeyVals) globalMap.unknownKeyVals = [];
            globalMap.unknownKeyVals.push(keyVal);
        }
      }
      const inputCount = inputKeyVals.length;
      const outputCount = outputKeyVals.length;
      const inputs = [];
      const outputs = [];
      for (const index of tools_1.range(inputCount)) {
        const input = {};
        for (const keyVal of inputKeyVals[index]) {
          convert.inputs.checkPubkey(keyVal);
          switch (keyVal.key[0]) {
            case typeFields_1.InputTypes.NON_WITNESS_UTXO:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.NON_WITNESS_UTXO
              );
              if (input.nonWitnessUtxo !== void 0) {
                throw new Error(
                  "Format Error: Input has multiple NON_WITNESS_UTXO"
                );
              }
              input.nonWitnessUtxo = convert.inputs.nonWitnessUtxo.decode(keyVal);
              break;
            case typeFields_1.InputTypes.WITNESS_UTXO:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.WITNESS_UTXO
              );
              if (input.witnessUtxo !== void 0) {
                throw new Error("Format Error: Input has multiple WITNESS_UTXO");
              }
              input.witnessUtxo = convert.inputs.witnessUtxo.decode(keyVal);
              break;
            case typeFields_1.InputTypes.PARTIAL_SIG:
              if (input.partialSig === void 0) {
                input.partialSig = [];
              }
              input.partialSig.push(convert.inputs.partialSig.decode(keyVal));
              break;
            case typeFields_1.InputTypes.SIGHASH_TYPE:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.SIGHASH_TYPE
              );
              if (input.sighashType !== void 0) {
                throw new Error("Format Error: Input has multiple SIGHASH_TYPE");
              }
              input.sighashType = convert.inputs.sighashType.decode(keyVal);
              break;
            case typeFields_1.InputTypes.REDEEM_SCRIPT:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.REDEEM_SCRIPT
              );
              if (input.redeemScript !== void 0) {
                throw new Error("Format Error: Input has multiple REDEEM_SCRIPT");
              }
              input.redeemScript = convert.inputs.redeemScript.decode(keyVal);
              break;
            case typeFields_1.InputTypes.WITNESS_SCRIPT:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.WITNESS_SCRIPT
              );
              if (input.witnessScript !== void 0) {
                throw new Error("Format Error: Input has multiple WITNESS_SCRIPT");
              }
              input.witnessScript = convert.inputs.witnessScript.decode(keyVal);
              break;
            case typeFields_1.InputTypes.BIP32_DERIVATION:
              if (input.bip32Derivation === void 0) {
                input.bip32Derivation = [];
              }
              input.bip32Derivation.push(
                convert.inputs.bip32Derivation.decode(keyVal)
              );
              break;
            case typeFields_1.InputTypes.FINAL_SCRIPTSIG:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.FINAL_SCRIPTSIG
              );
              input.finalScriptSig = convert.inputs.finalScriptSig.decode(keyVal);
              break;
            case typeFields_1.InputTypes.FINAL_SCRIPTWITNESS:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.FINAL_SCRIPTWITNESS
              );
              input.finalScriptWitness = convert.inputs.finalScriptWitness.decode(
                keyVal
              );
              break;
            case typeFields_1.InputTypes.POR_COMMITMENT:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.POR_COMMITMENT
              );
              input.porCommitment = convert.inputs.porCommitment.decode(keyVal);
              break;
            case typeFields_1.InputTypes.TAP_KEY_SIG:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.TAP_KEY_SIG
              );
              input.tapKeySig = convert.inputs.tapKeySig.decode(keyVal);
              break;
            case typeFields_1.InputTypes.TAP_SCRIPT_SIG:
              if (input.tapScriptSig === void 0) {
                input.tapScriptSig = [];
              }
              input.tapScriptSig.push(convert.inputs.tapScriptSig.decode(keyVal));
              break;
            case typeFields_1.InputTypes.TAP_LEAF_SCRIPT:
              if (input.tapLeafScript === void 0) {
                input.tapLeafScript = [];
              }
              input.tapLeafScript.push(convert.inputs.tapLeafScript.decode(keyVal));
              break;
            case typeFields_1.InputTypes.TAP_BIP32_DERIVATION:
              if (input.tapBip32Derivation === void 0) {
                input.tapBip32Derivation = [];
              }
              input.tapBip32Derivation.push(
                convert.inputs.tapBip32Derivation.decode(keyVal)
              );
              break;
            case typeFields_1.InputTypes.TAP_INTERNAL_KEY:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.TAP_INTERNAL_KEY
              );
              input.tapInternalKey = convert.inputs.tapInternalKey.decode(keyVal);
              break;
            case typeFields_1.InputTypes.TAP_MERKLE_ROOT:
              checkKeyBuffer(
                "input",
                keyVal.key,
                typeFields_1.InputTypes.TAP_MERKLE_ROOT
              );
              input.tapMerkleRoot = convert.inputs.tapMerkleRoot.decode(keyVal);
              break;
            default:
              if (!input.unknownKeyVals) input.unknownKeyVals = [];
              input.unknownKeyVals.push(keyVal);
          }
        }
        inputs.push(input);
      }
      for (const index of tools_1.range(outputCount)) {
        const output = {};
        for (const keyVal of outputKeyVals[index]) {
          convert.outputs.checkPubkey(keyVal);
          switch (keyVal.key[0]) {
            case typeFields_1.OutputTypes.REDEEM_SCRIPT:
              checkKeyBuffer(
                "output",
                keyVal.key,
                typeFields_1.OutputTypes.REDEEM_SCRIPT
              );
              if (output.redeemScript !== void 0) {
                throw new Error("Format Error: Output has multiple REDEEM_SCRIPT");
              }
              output.redeemScript = convert.outputs.redeemScript.decode(keyVal);
              break;
            case typeFields_1.OutputTypes.WITNESS_SCRIPT:
              checkKeyBuffer(
                "output",
                keyVal.key,
                typeFields_1.OutputTypes.WITNESS_SCRIPT
              );
              if (output.witnessScript !== void 0) {
                throw new Error("Format Error: Output has multiple WITNESS_SCRIPT");
              }
              output.witnessScript = convert.outputs.witnessScript.decode(keyVal);
              break;
            case typeFields_1.OutputTypes.BIP32_DERIVATION:
              if (output.bip32Derivation === void 0) {
                output.bip32Derivation = [];
              }
              output.bip32Derivation.push(
                convert.outputs.bip32Derivation.decode(keyVal)
              );
              break;
            case typeFields_1.OutputTypes.TAP_INTERNAL_KEY:
              checkKeyBuffer(
                "output",
                keyVal.key,
                typeFields_1.OutputTypes.TAP_INTERNAL_KEY
              );
              output.tapInternalKey = convert.outputs.tapInternalKey.decode(keyVal);
              break;
            case typeFields_1.OutputTypes.TAP_TREE:
              checkKeyBuffer(
                "output",
                keyVal.key,
                typeFields_1.OutputTypes.TAP_TREE
              );
              output.tapTree = convert.outputs.tapTree.decode(keyVal);
              break;
            case typeFields_1.OutputTypes.TAP_BIP32_DERIVATION:
              if (output.tapBip32Derivation === void 0) {
                output.tapBip32Derivation = [];
              }
              output.tapBip32Derivation.push(
                convert.outputs.tapBip32Derivation.decode(keyVal)
              );
              break;
            default:
              if (!output.unknownKeyVals) output.unknownKeyVals = [];
              output.unknownKeyVals.push(keyVal);
          }
        }
        outputs.push(output);
      }
      return { globalMap, inputs, outputs };
    }
    exports2.psbtFromKeyVals = psbtFromKeyVals;
  }
});

// node_modules/bip174/src/lib/parser/toBuffer.js
var require_toBuffer = __commonJS({
  "node_modules/bip174/src/lib/parser/toBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var convert = require_converter();
    var tools_1 = require_tools();
    function psbtToBuffer({ globalMap, inputs, outputs }) {
      const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
        globalMap,
        inputs,
        outputs
      });
      const globalBuffer = tools_1.keyValsToBuffer(globalKeyVals);
      const keyValsOrEmptyToBuffer = (keyVals) => keyVals.length === 0 ? [Buffer.from([0])] : keyVals.map(tools_1.keyValsToBuffer);
      const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
      const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
      const header = Buffer.allocUnsafe(5);
      header.writeUIntBE(482972169471, 0, 5);
      return Buffer.concat(
        [header, globalBuffer].concat(inputBuffers, outputBuffers)
      );
    }
    exports2.psbtToBuffer = psbtToBuffer;
    var sortKeyVals = (a, b) => {
      return a.key.compare(b.key);
    };
    function keyValsFromMap(keyValMap, converterFactory) {
      const keyHexSet = /* @__PURE__ */ new Set();
      const keyVals = Object.entries(keyValMap).reduce((result, [key, value]) => {
        if (key === "unknownKeyVals") return result;
        const converter = converterFactory[key];
        if (converter === void 0) return result;
        const encodedKeyVals = (Array.isArray(value) ? value : [value]).map(
          converter.encode
        );
        const keyHexes = encodedKeyVals.map((kv) => kv.key.toString("hex"));
        keyHexes.forEach((hex) => {
          if (keyHexSet.has(hex))
            throw new Error("Serialize Error: Duplicate key: " + hex);
          keyHexSet.add(hex);
        });
        return result.concat(encodedKeyVals);
      }, []);
      const otherKeyVals = keyValMap.unknownKeyVals ? keyValMap.unknownKeyVals.filter((keyVal) => {
        return !keyHexSet.has(keyVal.key.toString("hex"));
      }) : [];
      return keyVals.concat(otherKeyVals).sort(sortKeyVals);
    }
    function psbtToKeyVals({ globalMap, inputs, outputs }) {
      return {
        globalKeyVals: keyValsFromMap(globalMap, convert.globals),
        inputKeyVals: inputs.map((i) => keyValsFromMap(i, convert.inputs)),
        outputKeyVals: outputs.map((o) => keyValsFromMap(o, convert.outputs))
      };
    }
    exports2.psbtToKeyVals = psbtToKeyVals;
  }
});

// node_modules/bip174/src/lib/parser/index.js
var require_parser = __commonJS({
  "node_modules/bip174/src/lib/parser/index.js"(exports2) {
    "use strict";
    function __export2(m) {
      for (var p in m) if (!exports2.hasOwnProperty(p)) exports2[p] = m[p];
    }
    Object.defineProperty(exports2, "__esModule", { value: true });
    __export2(require_fromBuffer());
    __export2(require_toBuffer());
  }
});

// node_modules/bip174/src/lib/combiner/index.js
var require_combiner = __commonJS({
  "node_modules/bip174/src/lib/combiner/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var parser_1 = require_parser();
    function combine(psbts) {
      const self = psbts[0];
      const selfKeyVals = parser_1.psbtToKeyVals(self);
      const others = psbts.slice(1);
      if (others.length === 0) throw new Error("Combine: Nothing to combine");
      const selfTx = getTx(self);
      if (selfTx === void 0) {
        throw new Error("Combine: Self missing transaction");
      }
      const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
      const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
      const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
      for (const other of others) {
        const otherTx = getTx(other);
        if (otherTx === void 0 || !otherTx.toBuffer().equals(selfTx.toBuffer())) {
          throw new Error(
            "Combine: One of the Psbts does not have the same transaction."
          );
        }
        const otherKeyVals = parser_1.psbtToKeyVals(other);
        const otherGlobalSet = getKeySet(otherKeyVals.globalKeyVals);
        otherGlobalSet.forEach(
          keyPusher(
            selfGlobalSet,
            selfKeyVals.globalKeyVals,
            otherKeyVals.globalKeyVals
          )
        );
        const otherInputSets = otherKeyVals.inputKeyVals.map(getKeySet);
        otherInputSets.forEach(
          (inputSet, idx) => inputSet.forEach(
            keyPusher(
              selfInputSets[idx],
              selfKeyVals.inputKeyVals[idx],
              otherKeyVals.inputKeyVals[idx]
            )
          )
        );
        const otherOutputSets = otherKeyVals.outputKeyVals.map(getKeySet);
        otherOutputSets.forEach(
          (outputSet, idx) => outputSet.forEach(
            keyPusher(
              selfOutputSets[idx],
              selfKeyVals.outputKeyVals[idx],
              otherKeyVals.outputKeyVals[idx]
            )
          )
        );
      }
      return parser_1.psbtFromKeyVals(selfTx, {
        globalMapKeyVals: selfKeyVals.globalKeyVals,
        inputKeyVals: selfKeyVals.inputKeyVals,
        outputKeyVals: selfKeyVals.outputKeyVals
      });
    }
    exports2.combine = combine;
    function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
      return (key) => {
        if (selfSet.has(key)) return;
        const newKv = otherKeyVals.filter((kv) => kv.key.toString("hex") === key)[0];
        selfKeyVals.push(newKv);
        selfSet.add(key);
      };
    }
    function getTx(psbt) {
      return psbt.globalMap.unsignedTx;
    }
    function getKeySet(keyVals) {
      const set = /* @__PURE__ */ new Set();
      keyVals.forEach((keyVal) => {
        const hex = keyVal.key.toString("hex");
        if (set.has(hex))
          throw new Error("Combine: KeyValue Map keys should be unique");
        set.add(hex);
      });
      return set;
    }
  }
});

// node_modules/bip174/src/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/bip174/src/lib/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var converter = require_converter();
    function checkForInput(inputs, inputIndex) {
      const input = inputs[inputIndex];
      if (input === void 0) throw new Error(`No input #${inputIndex}`);
      return input;
    }
    exports2.checkForInput = checkForInput;
    function checkForOutput(outputs, outputIndex) {
      const output = outputs[outputIndex];
      if (output === void 0) throw new Error(`No output #${outputIndex}`);
      return output;
    }
    exports2.checkForOutput = checkForOutput;
    function checkHasKey(checkKeyVal, keyVals, enumLength) {
      if (checkKeyVal.key[0] < enumLength) {
        throw new Error(
          `Use the method for your specific key instead of addUnknownKeyVal*`
        );
      }
      if (keyVals && keyVals.filter((kv) => kv.key.equals(checkKeyVal.key)).length !== 0) {
        throw new Error(`Duplicate Key: ${checkKeyVal.key.toString("hex")}`);
      }
    }
    exports2.checkHasKey = checkHasKey;
    function getEnumLength(myenum) {
      let count = 0;
      Object.keys(myenum).forEach((val) => {
        if (Number(isNaN(Number(val)))) {
          count++;
        }
      });
      return count;
    }
    exports2.getEnumLength = getEnumLength;
    function inputCheckUncleanFinalized(inputIndex, input) {
      let result = false;
      if (input.nonWitnessUtxo || input.witnessUtxo) {
        const needScriptSig = !!input.redeemScript;
        const needWitnessScript = !!input.witnessScript;
        const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
        const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
        const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
        result = scriptSigOK && witnessScriptOK && hasOneFinal;
      }
      if (result === false) {
        throw new Error(
          `Input #${inputIndex} has too much or too little data to clean`
        );
      }
    }
    exports2.inputCheckUncleanFinalized = inputCheckUncleanFinalized;
    function throwForUpdateMaker(typeName, name, expected, data) {
      throw new Error(
        `Data for ${typeName} key ${name} is incorrect: Expected ${expected} and got ${JSON.stringify(data)}`
      );
    }
    function updateMaker(typeName) {
      return (updateData, mainData) => {
        for (const name of Object.keys(updateData)) {
          const data = updateData[name];
          const { canAdd, canAddToArray, check, expected } = (
            // @ts-ignore
            converter[typeName + "s"][name] || {}
          );
          const isArray = !!canAddToArray;
          if (check) {
            if (isArray) {
              if (!Array.isArray(data) || // @ts-ignore
              mainData[name] && !Array.isArray(mainData[name])) {
                throw new Error(`Key type ${name} must be an array`);
              }
              if (!data.every(check)) {
                throwForUpdateMaker(typeName, name, expected, data);
              }
              const arr = mainData[name] || [];
              const dupeCheckSet = /* @__PURE__ */ new Set();
              if (!data.every((v) => canAddToArray(arr, v, dupeCheckSet))) {
                throw new Error("Can not add duplicate data to array");
              }
              mainData[name] = arr.concat(data);
            } else {
              if (!check(data)) {
                throwForUpdateMaker(typeName, name, expected, data);
              }
              if (!canAdd(mainData, data)) {
                throw new Error(`Can not add duplicate data to ${typeName}`);
              }
              mainData[name] = data;
            }
          }
        }
      };
    }
    exports2.updateGlobal = updateMaker("global");
    exports2.updateInput = updateMaker("input");
    exports2.updateOutput = updateMaker("output");
    function addInputAttributes(inputs, data) {
      const index = inputs.length - 1;
      const input = checkForInput(inputs, index);
      exports2.updateInput(data, input);
    }
    exports2.addInputAttributes = addInputAttributes;
    function addOutputAttributes(outputs, data) {
      const index = outputs.length - 1;
      const output = checkForOutput(outputs, index);
      exports2.updateOutput(data, output);
    }
    exports2.addOutputAttributes = addOutputAttributes;
    function defaultVersionSetter(version, txBuf) {
      if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
        throw new Error("Set Version: Invalid Transaction");
      }
      txBuf.writeUInt32LE(version, 0);
      return txBuf;
    }
    exports2.defaultVersionSetter = defaultVersionSetter;
    function defaultLocktimeSetter(locktime, txBuf) {
      if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
        throw new Error("Set Locktime: Invalid Transaction");
      }
      txBuf.writeUInt32LE(locktime, txBuf.length - 4);
      return txBuf;
    }
    exports2.defaultLocktimeSetter = defaultLocktimeSetter;
  }
});

// node_modules/bip174/src/lib/psbt.js
var require_psbt = __commonJS({
  "node_modules/bip174/src/lib/psbt.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var combiner_1 = require_combiner();
    var parser_1 = require_parser();
    var typeFields_1 = require_typeFields();
    var utils_1 = require_utils2();
    var Psbt = class {
      constructor(tx) {
        this.inputs = [];
        this.outputs = [];
        this.globalMap = {
          unsignedTx: tx
        };
      }
      static fromBase64(data, txFromBuffer) {
        const buffer = Buffer.from(data, "base64");
        return this.fromBuffer(buffer, txFromBuffer);
      }
      static fromHex(data, txFromBuffer) {
        const buffer = Buffer.from(data, "hex");
        return this.fromBuffer(buffer, txFromBuffer);
      }
      static fromBuffer(buffer, txFromBuffer) {
        const results = parser_1.psbtFromBuffer(buffer, txFromBuffer);
        const psbt = new this(results.globalMap.unsignedTx);
        Object.assign(psbt, results);
        return psbt;
      }
      toBase64() {
        const buffer = this.toBuffer();
        return buffer.toString("base64");
      }
      toHex() {
        const buffer = this.toBuffer();
        return buffer.toString("hex");
      }
      toBuffer() {
        return parser_1.psbtToBuffer(this);
      }
      updateGlobal(updateData) {
        utils_1.updateGlobal(updateData, this.globalMap);
        return this;
      }
      updateInput(inputIndex, updateData) {
        const input = utils_1.checkForInput(this.inputs, inputIndex);
        utils_1.updateInput(updateData, input);
        return this;
      }
      updateOutput(outputIndex, updateData) {
        const output = utils_1.checkForOutput(this.outputs, outputIndex);
        utils_1.updateOutput(updateData, output);
        return this;
      }
      addUnknownKeyValToGlobal(keyVal) {
        utils_1.checkHasKey(
          keyVal,
          this.globalMap.unknownKeyVals,
          utils_1.getEnumLength(typeFields_1.GlobalTypes)
        );
        if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
        this.globalMap.unknownKeyVals.push(keyVal);
        return this;
      }
      addUnknownKeyValToInput(inputIndex, keyVal) {
        const input = utils_1.checkForInput(this.inputs, inputIndex);
        utils_1.checkHasKey(
          keyVal,
          input.unknownKeyVals,
          utils_1.getEnumLength(typeFields_1.InputTypes)
        );
        if (!input.unknownKeyVals) input.unknownKeyVals = [];
        input.unknownKeyVals.push(keyVal);
        return this;
      }
      addUnknownKeyValToOutput(outputIndex, keyVal) {
        const output = utils_1.checkForOutput(this.outputs, outputIndex);
        utils_1.checkHasKey(
          keyVal,
          output.unknownKeyVals,
          utils_1.getEnumLength(typeFields_1.OutputTypes)
        );
        if (!output.unknownKeyVals) output.unknownKeyVals = [];
        output.unknownKeyVals.push(keyVal);
        return this;
      }
      addInput(inputData) {
        this.globalMap.unsignedTx.addInput(inputData);
        this.inputs.push({
          unknownKeyVals: []
        });
        const addKeyVals = inputData.unknownKeyVals || [];
        const inputIndex = this.inputs.length - 1;
        if (!Array.isArray(addKeyVals)) {
          throw new Error("unknownKeyVals must be an Array");
        }
        addKeyVals.forEach(
          (keyVal) => this.addUnknownKeyValToInput(inputIndex, keyVal)
        );
        utils_1.addInputAttributes(this.inputs, inputData);
        return this;
      }
      addOutput(outputData) {
        this.globalMap.unsignedTx.addOutput(outputData);
        this.outputs.push({
          unknownKeyVals: []
        });
        const addKeyVals = outputData.unknownKeyVals || [];
        const outputIndex = this.outputs.length - 1;
        if (!Array.isArray(addKeyVals)) {
          throw new Error("unknownKeyVals must be an Array");
        }
        addKeyVals.forEach(
          (keyVal) => this.addUnknownKeyValToOutput(outputIndex, keyVal)
        );
        utils_1.addOutputAttributes(this.outputs, outputData);
        return this;
      }
      clearFinalizedInput(inputIndex) {
        const input = utils_1.checkForInput(this.inputs, inputIndex);
        utils_1.inputCheckUncleanFinalized(inputIndex, input);
        for (const key of Object.keys(input)) {
          if (![
            "witnessUtxo",
            "nonWitnessUtxo",
            "finalScriptSig",
            "finalScriptWitness",
            "unknownKeyVals"
          ].includes(key)) {
            delete input[key];
          }
        }
        return this;
      }
      combine(...those) {
        const result = combiner_1.combine([this].concat(those));
        Object.assign(this, result);
        return this;
      }
      getTransaction() {
        return this.globalMap.unsignedTx.toBuffer();
      }
    };
    exports2.Psbt = Psbt;
  }
});

// node_modules/bitcoinjs-lib/src/psbt/psbtutils.js
var require_psbtutils = __commonJS({
  "node_modules/bitcoinjs-lib/src/psbt/psbtutils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.signatureBlocksAction = exports2.checkInputForSig = exports2.pubkeyInScript = exports2.pubkeyPositionInScript = exports2.witnessStackToScriptWitness = exports2.isP2TR = exports2.isP2SHScript = exports2.isP2WSHScript = exports2.isP2WPKH = exports2.isP2PKH = exports2.isP2PK = exports2.isP2MS = void 0;
    var varuint = require_varint();
    var bscript = require_script();
    var transaction_1 = require_transaction();
    var crypto_1 = require_crypto();
    var payments = require_payments();
    function isPaymentFactory(payment) {
      return (script2) => {
        try {
          payment({ output: script2 });
          return true;
        } catch (err) {
          return false;
        }
      };
    }
    exports2.isP2MS = isPaymentFactory(payments.p2ms);
    exports2.isP2PK = isPaymentFactory(payments.p2pk);
    exports2.isP2PKH = isPaymentFactory(payments.p2pkh);
    exports2.isP2WPKH = isPaymentFactory(payments.p2wpkh);
    exports2.isP2WSHScript = isPaymentFactory(payments.p2wsh);
    exports2.isP2SHScript = isPaymentFactory(payments.p2sh);
    exports2.isP2TR = isPaymentFactory(payments.p2tr);
    function witnessStackToScriptWitness(witness) {
      let buffer = Buffer.allocUnsafe(0);
      function writeSlice(slice) {
        buffer = Buffer.concat([buffer, Buffer.from(slice)]);
      }
      function writeVarInt(i) {
        const currentLen = buffer.length;
        const varintLen = varuint.encodingLength(i);
        buffer = Buffer.concat([buffer, Buffer.allocUnsafe(varintLen)]);
        varuint.encode(i, buffer, currentLen);
      }
      function writeVarSlice(slice) {
        writeVarInt(slice.length);
        writeSlice(slice);
      }
      function writeVector(vector) {
        writeVarInt(vector.length);
        vector.forEach(writeVarSlice);
      }
      writeVector(witness);
      return buffer;
    }
    exports2.witnessStackToScriptWitness = witnessStackToScriptWitness;
    function pubkeyPositionInScript(pubkey, script2) {
      const pubkeyHash = (0, crypto_1.hash160)(pubkey);
      const pubkeyXOnly = pubkey.slice(1, 33);
      const decompiled = bscript.decompile(script2);
      if (decompiled === null) throw new Error("Unknown script error");
      return decompiled.findIndex((element) => {
        if (typeof element === "number") return false;
        return element.equals(pubkey) || element.equals(pubkeyHash) || element.equals(pubkeyXOnly);
      });
    }
    exports2.pubkeyPositionInScript = pubkeyPositionInScript;
    function pubkeyInScript(pubkey, script2) {
      return pubkeyPositionInScript(pubkey, script2) !== -1;
    }
    exports2.pubkeyInScript = pubkeyInScript;
    function checkInputForSig(input, action) {
      const pSigs = extractPartialSigs(input);
      return pSigs.some(
        (pSig) => signatureBlocksAction(pSig, bscript.signature.decode, action)
      );
    }
    exports2.checkInputForSig = checkInputForSig;
    function signatureBlocksAction(signature, signatureDecodeFn, action) {
      const { hashType } = signatureDecodeFn(signature);
      const whitelist = [];
      const isAnyoneCanPay = hashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY;
      if (isAnyoneCanPay) whitelist.push("addInput");
      const hashMod = hashType & 31;
      switch (hashMod) {
        case transaction_1.Transaction.SIGHASH_ALL:
          break;
        case transaction_1.Transaction.SIGHASH_SINGLE:
        case transaction_1.Transaction.SIGHASH_NONE:
          whitelist.push("addOutput");
          whitelist.push("setInputSequence");
          break;
      }
      if (whitelist.indexOf(action) === -1) {
        return true;
      }
      return false;
    }
    exports2.signatureBlocksAction = signatureBlocksAction;
    function extractPartialSigs(input) {
      let pSigs = [];
      if ((input.partialSig || []).length === 0) {
        if (!input.finalScriptSig && !input.finalScriptWitness) return [];
        pSigs = getPsigsFromInputFinalScripts(input);
      } else {
        pSigs = input.partialSig;
      }
      return pSigs.map((p) => p.signature);
    }
    function getPsigsFromInputFinalScripts(input) {
      const scriptItems = !input.finalScriptSig ? [] : bscript.decompile(input.finalScriptSig) || [];
      const witnessItems = !input.finalScriptWitness ? [] : bscript.decompile(input.finalScriptWitness) || [];
      return scriptItems.concat(witnessItems).filter((item) => {
        return Buffer.isBuffer(item) && bscript.isCanonicalScriptSignature(item);
      }).map((sig) => ({ signature: sig }));
    }
  }
});

// node_modules/bitcoinjs-lib/src/psbt/bip371.js
var require_bip371 = __commonJS({
  "node_modules/bitcoinjs-lib/src/psbt/bip371.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.checkTaprootInputForSigs = exports2.tapTreeFromList = exports2.tapTreeToList = exports2.tweakInternalPubKey = exports2.checkTaprootOutputFields = exports2.checkTaprootInputFields = exports2.isTaprootOutput = exports2.isTaprootInput = exports2.serializeTaprootSignature = exports2.tapScriptFinalizer = exports2.toXOnly = void 0;
    var types_1 = require_types();
    var transaction_1 = require_transaction();
    var psbtutils_1 = require_psbtutils();
    var bip341_1 = require_bip341();
    var payments_1 = require_payments();
    var psbtutils_2 = require_psbtutils();
    var toXOnly2 = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
    exports2.toXOnly = toXOnly2;
    function tapScriptFinalizer(inputIndex, input, tapLeafHashToFinalize) {
      const tapLeaf = findTapLeafToFinalize(
        input,
        inputIndex,
        tapLeafHashToFinalize
      );
      try {
        const sigs = sortSignatures(input, tapLeaf);
        const witness = sigs.concat(tapLeaf.script).concat(tapLeaf.controlBlock);
        return {
          finalScriptWitness: (0, psbtutils_1.witnessStackToScriptWitness)(witness)
        };
      } catch (err) {
        throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
      }
    }
    exports2.tapScriptFinalizer = tapScriptFinalizer;
    function serializeTaprootSignature(sig, sighashType) {
      const sighashTypeByte = sighashType ? Buffer.from([sighashType]) : Buffer.from([]);
      return Buffer.concat([sig, sighashTypeByte]);
    }
    exports2.serializeTaprootSignature = serializeTaprootSignature;
    function isTaprootInput(input) {
      return input && !!(input.tapInternalKey || input.tapMerkleRoot || input.tapLeafScript && input.tapLeafScript.length || input.tapBip32Derivation && input.tapBip32Derivation.length || input.witnessUtxo && (0, psbtutils_1.isP2TR)(input.witnessUtxo.script));
    }
    exports2.isTaprootInput = isTaprootInput;
    function isTaprootOutput(output, script2) {
      return output && !!(output.tapInternalKey || output.tapTree || output.tapBip32Derivation && output.tapBip32Derivation.length || script2 && (0, psbtutils_1.isP2TR)(script2));
    }
    exports2.isTaprootOutput = isTaprootOutput;
    function checkTaprootInputFields(inputData, newInputData, action) {
      checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action);
      checkIfTapLeafInTree(inputData, newInputData, action);
    }
    exports2.checkTaprootInputFields = checkTaprootInputFields;
    function checkTaprootOutputFields(outputData, newOutputData, action) {
      checkMixedTaprootAndNonTaprootOutputFields(outputData, newOutputData, action);
      checkTaprootScriptPubkey(outputData, newOutputData);
    }
    exports2.checkTaprootOutputFields = checkTaprootOutputFields;
    function checkTaprootScriptPubkey(outputData, newOutputData) {
      if (!newOutputData.tapTree && !newOutputData.tapInternalKey) return;
      const tapInternalKey = newOutputData.tapInternalKey || outputData.tapInternalKey;
      const tapTree = newOutputData.tapTree || outputData.tapTree;
      if (tapInternalKey) {
        const { script: scriptPubkey } = outputData;
        const script2 = getTaprootScripPubkey(tapInternalKey, tapTree);
        if (scriptPubkey && !scriptPubkey.equals(script2))
          throw new Error("Error adding output. Script or address missmatch.");
      }
    }
    function getTaprootScripPubkey(tapInternalKey, tapTree) {
      const scriptTree = tapTree && tapTreeFromList(tapTree.leaves);
      const { output } = (0, payments_1.p2tr)({
        internalPubkey: tapInternalKey,
        scriptTree
      });
      return output;
    }
    function tweakInternalPubKey(inputIndex, input) {
      const tapInternalKey = input.tapInternalKey;
      const outputKey = tapInternalKey && (0, bip341_1.tweakKey)(tapInternalKey, input.tapMerkleRoot);
      if (!outputKey)
        throw new Error(
          `Cannot tweak tap internal key for input #${inputIndex}. Public key: ${tapInternalKey && tapInternalKey.toString("hex")}`
        );
      return outputKey.x;
    }
    exports2.tweakInternalPubKey = tweakInternalPubKey;
    function tapTreeToList(tree) {
      if (!(0, types_1.isTaptree)(tree))
        throw new Error(
          "Cannot convert taptree to tapleaf list. Expecting a tapree structure."
        );
      return _tapTreeToList(tree);
    }
    exports2.tapTreeToList = tapTreeToList;
    function tapTreeFromList(leaves = []) {
      if (leaves.length === 1 && leaves[0].depth === 0)
        return {
          output: leaves[0].script,
          version: leaves[0].leafVersion
        };
      return instertLeavesInTree(leaves);
    }
    exports2.tapTreeFromList = tapTreeFromList;
    function checkTaprootInputForSigs(input, action) {
      const sigs = extractTaprootSigs(input);
      return sigs.some(
        (sig) => (0, psbtutils_2.signatureBlocksAction)(sig, decodeSchnorrSignature, action)
      );
    }
    exports2.checkTaprootInputForSigs = checkTaprootInputForSigs;
    function decodeSchnorrSignature(signature) {
      return {
        signature: signature.slice(0, 64),
        hashType: signature.slice(64)[0] || transaction_1.Transaction.SIGHASH_DEFAULT
      };
    }
    function extractTaprootSigs(input) {
      const sigs = [];
      if (input.tapKeySig) sigs.push(input.tapKeySig);
      if (input.tapScriptSig)
        sigs.push(...input.tapScriptSig.map((s) => s.signature));
      if (!sigs.length) {
        const finalTapKeySig = getTapKeySigFromWithness(input.finalScriptWitness);
        if (finalTapKeySig) sigs.push(finalTapKeySig);
      }
      return sigs;
    }
    function getTapKeySigFromWithness(finalScriptWitness) {
      if (!finalScriptWitness) return;
      const witness = finalScriptWitness.slice(2);
      if (witness.length === 64 || witness.length === 65) return witness;
    }
    function _tapTreeToList(tree, leaves = [], depth = 0) {
      if (depth > bip341_1.MAX_TAPTREE_DEPTH)
        throw new Error("Max taptree depth exceeded.");
      if (!tree) return [];
      if ((0, types_1.isTapleaf)(tree)) {
        leaves.push({
          depth,
          leafVersion: tree.version || bip341_1.LEAF_VERSION_TAPSCRIPT,
          script: tree.output
        });
        return leaves;
      }
      if (tree[0]) _tapTreeToList(tree[0], leaves, depth + 1);
      if (tree[1]) _tapTreeToList(tree[1], leaves, depth + 1);
      return leaves;
    }
    function instertLeavesInTree(leaves) {
      let tree;
      for (const leaf of leaves) {
        tree = instertLeafInTree(leaf, tree);
        if (!tree) throw new Error(`No room left to insert tapleaf in tree`);
      }
      return tree;
    }
    function instertLeafInTree(leaf, tree, depth = 0) {
      if (depth > bip341_1.MAX_TAPTREE_DEPTH)
        throw new Error("Max taptree depth exceeded.");
      if (leaf.depth === depth) {
        if (!tree)
          return {
            output: leaf.script,
            version: leaf.leafVersion
          };
        return;
      }
      if ((0, types_1.isTapleaf)(tree)) return;
      const leftSide = instertLeafInTree(leaf, tree && tree[0], depth + 1);
      if (leftSide) return [leftSide, tree && tree[1]];
      const rightSide = instertLeafInTree(leaf, tree && tree[1], depth + 1);
      if (rightSide) return [tree && tree[0], rightSide];
    }
    function checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action) {
      const isBadTaprootUpdate = isTaprootInput(inputData) && hasNonTaprootFields(newInputData);
      const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootInput(newInputData);
      const hasMixedFields = inputData === newInputData && isTaprootInput(newInputData) && hasNonTaprootFields(newInputData);
      if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
        throw new Error(
          `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
        );
    }
    function checkMixedTaprootAndNonTaprootOutputFields(inputData, newInputData, action) {
      const isBadTaprootUpdate = isTaprootOutput(inputData) && hasNonTaprootFields(newInputData);
      const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootOutput(newInputData);
      const hasMixedFields = inputData === newInputData && isTaprootOutput(newInputData) && hasNonTaprootFields(newInputData);
      if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
        throw new Error(
          `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
        );
    }
    function checkIfTapLeafInTree(inputData, newInputData, action) {
      if (newInputData.tapMerkleRoot) {
        const newLeafsInTree = (newInputData.tapLeafScript || []).every(
          (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
        );
        const oldLeafsInTree = (inputData.tapLeafScript || []).every(
          (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
        );
        if (!newLeafsInTree || !oldLeafsInTree)
          throw new Error(
            `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
          );
      } else if (inputData.tapMerkleRoot) {
        const newLeafsInTree = (newInputData.tapLeafScript || []).every(
          (l) => isTapLeafInTree(l, inputData.tapMerkleRoot)
        );
        if (!newLeafsInTree)
          throw new Error(
            `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
          );
      }
    }
    function isTapLeafInTree(tapLeaf, merkleRoot) {
      if (!merkleRoot) return true;
      const leafHash = (0, bip341_1.tapleafHash)({
        output: tapLeaf.script,
        version: tapLeaf.leafVersion
      });
      const rootHash = (0, bip341_1.rootHashFromPath)(
        tapLeaf.controlBlock,
        leafHash
      );
      return rootHash.equals(merkleRoot);
    }
    function sortSignatures(input, tapLeaf) {
      const leafHash = (0, bip341_1.tapleafHash)({
        output: tapLeaf.script,
        version: tapLeaf.leafVersion
      });
      return (input.tapScriptSig || []).filter((tss) => tss.leafHash.equals(leafHash)).map((tss) => addPubkeyPositionInScript(tapLeaf.script, tss)).sort((t1, t2) => t2.positionInScript - t1.positionInScript).map((t) => t.signature);
    }
    function addPubkeyPositionInScript(script2, tss) {
      return Object.assign(
        {
          positionInScript: (0, psbtutils_1.pubkeyPositionInScript)(
            tss.pubkey,
            script2
          )
        },
        tss
      );
    }
    function findTapLeafToFinalize(input, inputIndex, leafHashToFinalize) {
      if (!input.tapScriptSig || !input.tapScriptSig.length)
        throw new Error(
          `Can not finalize taproot input #${inputIndex}. No tapleaf script signature provided.`
        );
      const tapLeaf = (input.tapLeafScript || []).sort((a, b) => a.controlBlock.length - b.controlBlock.length).find(
        (leaf) => canFinalizeLeaf(leaf, input.tapScriptSig, leafHashToFinalize)
      );
      if (!tapLeaf)
        throw new Error(
          `Can not finalize taproot input #${inputIndex}. Signature for tapleaf script not found.`
        );
      return tapLeaf;
    }
    function canFinalizeLeaf(leaf, tapScriptSig, hash) {
      const leafHash = (0, bip341_1.tapleafHash)({
        output: leaf.script,
        version: leaf.leafVersion
      });
      const whiteListedHash = !hash || hash.equals(leafHash);
      return whiteListedHash && tapScriptSig.find((tss) => tss.leafHash.equals(leafHash)) !== void 0;
    }
    function hasNonTaprootFields(io) {
      return io && !!(io.redeemScript || io.witnessScript || io.bip32Derivation && io.bip32Derivation.length);
    }
  }
});

// node_modules/bitcoinjs-lib/src/psbt.js
var require_psbt2 = __commonJS({
  "node_modules/bitcoinjs-lib/src/psbt.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Psbt = void 0;
    var bip174_1 = require_psbt();
    var varuint = require_varint();
    var utils_1 = require_utils2();
    var address_1 = require_address();
    var bufferutils_1 = require_bufferutils();
    var networks_1 = require_networks();
    var payments = require_payments();
    var bip341_1 = require_bip341();
    var bscript = require_script();
    var transaction_1 = require_transaction();
    var bip371_1 = require_bip371();
    var psbtutils_1 = require_psbtutils();
    var DEFAULT_OPTS = {
      /**
       * A bitcoinjs Network object. This is only used if you pass an `address`
       * parameter to addOutput. Otherwise it is not needed and can be left default.
       */
      network: networks_1.bitcoin,
      /**
       * When extractTransaction is called, the fee rate is checked.
       * THIS IS NOT TO BE RELIED ON.
       * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
       */
      maximumFeeRate: 5e3
      // satoshi per byte
    };
    var Psbt = class _Psbt {
      static fromBase64(data, opts = {}) {
        const buffer = Buffer.from(data, "base64");
        return this.fromBuffer(buffer, opts);
      }
      static fromHex(data, opts = {}) {
        const buffer = Buffer.from(data, "hex");
        return this.fromBuffer(buffer, opts);
      }
      static fromBuffer(buffer, opts = {}) {
        const psbtBase = bip174_1.Psbt.fromBuffer(buffer, transactionFromBuffer);
        const psbt = new _Psbt(opts, psbtBase);
        checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
        return psbt;
      }
      constructor(opts = {}, data = new bip174_1.Psbt(new PsbtTransaction())) {
        this.data = data;
        this.opts = Object.assign({}, DEFAULT_OPTS, opts);
        this.__CACHE = {
          __NON_WITNESS_UTXO_TX_CACHE: [],
          __NON_WITNESS_UTXO_BUF_CACHE: [],
          __TX_IN_CACHE: {},
          __TX: this.data.globalMap.unsignedTx.tx,
          // Psbt's predecessor (TransactionBuilder - now removed) behavior
          // was to not confirm input values  before signing.
          // Even though we highly encourage people to get
          // the full parent transaction to verify values, the ability to
          // sign non-segwit inputs without the full transaction was often
          // requested. So the only way to activate is to use @ts-ignore.
          // We will disable exporting the Psbt when unsafe sign is active.
          // because it is not BIP174 compliant.
          __UNSAFE_SIGN_NONSEGWIT: false
        };
        if (this.data.inputs.length === 0) this.setVersion(2);
        const dpew = (obj, attr, enumerable, writable) => Object.defineProperty(obj, attr, {
          enumerable,
          writable
        });
        dpew(this, "__CACHE", false, true);
        dpew(this, "opts", false, true);
      }
      get inputCount() {
        return this.data.inputs.length;
      }
      get version() {
        return this.__CACHE.__TX.version;
      }
      set version(version) {
        this.setVersion(version);
      }
      get locktime() {
        return this.__CACHE.__TX.locktime;
      }
      set locktime(locktime) {
        this.setLocktime(locktime);
      }
      get txInputs() {
        return this.__CACHE.__TX.ins.map((input) => ({
          hash: (0, bufferutils_1.cloneBuffer)(input.hash),
          index: input.index,
          sequence: input.sequence
        }));
      }
      get txOutputs() {
        return this.__CACHE.__TX.outs.map((output) => {
          let address;
          try {
            address = (0, address_1.fromOutputScript)(
              output.script,
              this.opts.network
            );
          } catch (_) {
          }
          return {
            script: (0, bufferutils_1.cloneBuffer)(output.script),
            value: output.value,
            address
          };
        });
      }
      combine(...those) {
        this.data.combine(...those.map((o) => o.data));
        return this;
      }
      clone() {
        const res = _Psbt.fromBuffer(this.data.toBuffer());
        res.opts = JSON.parse(JSON.stringify(this.opts));
        return res;
      }
      setMaximumFeeRate(satoshiPerByte) {
        check32Bit(satoshiPerByte);
        this.opts.maximumFeeRate = satoshiPerByte;
      }
      setVersion(version) {
        check32Bit(version);
        checkInputsForPartialSig(this.data.inputs, "setVersion");
        const c = this.__CACHE;
        c.__TX.version = version;
        c.__EXTRACTED_TX = void 0;
        return this;
      }
      setLocktime(locktime) {
        check32Bit(locktime);
        checkInputsForPartialSig(this.data.inputs, "setLocktime");
        const c = this.__CACHE;
        c.__TX.locktime = locktime;
        c.__EXTRACTED_TX = void 0;
        return this;
      }
      setInputSequence(inputIndex, sequence) {
        check32Bit(sequence);
        checkInputsForPartialSig(this.data.inputs, "setInputSequence");
        const c = this.__CACHE;
        if (c.__TX.ins.length <= inputIndex) {
          throw new Error("Input index too high");
        }
        c.__TX.ins[inputIndex].sequence = sequence;
        c.__EXTRACTED_TX = void 0;
        return this;
      }
      addInputs(inputDatas) {
        inputDatas.forEach((inputData) => this.addInput(inputData));
        return this;
      }
      addInput(inputData) {
        if (arguments.length > 1 || !inputData || inputData.hash === void 0 || inputData.index === void 0) {
          throw new Error(
            `Invalid arguments for Psbt.addInput. Requires single object with at least [hash] and [index]`
          );
        }
        (0, bip371_1.checkTaprootInputFields)(inputData, inputData, "addInput");
        checkInputsForPartialSig(this.data.inputs, "addInput");
        if (inputData.witnessScript) checkInvalidP2WSH(inputData.witnessScript);
        const c = this.__CACHE;
        this.data.addInput(inputData);
        const txIn = c.__TX.ins[c.__TX.ins.length - 1];
        checkTxInputCache(c, txIn);
        const inputIndex = this.data.inputs.length - 1;
        const input = this.data.inputs[inputIndex];
        if (input.nonWitnessUtxo) {
          addNonWitnessTxCache(this.__CACHE, input, inputIndex);
        }
        c.__FEE = void 0;
        c.__FEE_RATE = void 0;
        c.__EXTRACTED_TX = void 0;
        return this;
      }
      addOutputs(outputDatas) {
        outputDatas.forEach((outputData) => this.addOutput(outputData));
        return this;
      }
      addOutput(outputData) {
        if (arguments.length > 1 || !outputData || outputData.value === void 0 || outputData.address === void 0 && outputData.script === void 0) {
          throw new Error(
            `Invalid arguments for Psbt.addOutput. Requires single object with at least [script or address] and [value]`
          );
        }
        checkInputsForPartialSig(this.data.inputs, "addOutput");
        const { address } = outputData;
        if (typeof address === "string") {
          const { network } = this.opts;
          const script2 = (0, address_1.toOutputScript)(address, network);
          outputData = Object.assign({}, outputData, { script: script2 });
        }
        (0, bip371_1.checkTaprootOutputFields)(outputData, outputData, "addOutput");
        const c = this.__CACHE;
        this.data.addOutput(outputData);
        c.__FEE = void 0;
        c.__FEE_RATE = void 0;
        c.__EXTRACTED_TX = void 0;
        return this;
      }
      extractTransaction(disableFeeCheck) {
        if (!this.data.inputs.every(isFinalized)) throw new Error("Not finalized");
        const c = this.__CACHE;
        if (!disableFeeCheck) {
          checkFees(this, c, this.opts);
        }
        if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX;
        const tx = c.__TX.clone();
        inputFinalizeGetAmts(this.data.inputs, tx, c, true);
        return tx;
      }
      getFeeRate() {
        return getTxCacheValue(
          "__FEE_RATE",
          "fee rate",
          this.data.inputs,
          this.__CACHE
        );
      }
      getFee() {
        return getTxCacheValue("__FEE", "fee", this.data.inputs, this.__CACHE);
      }
      finalizeAllInputs() {
        (0, utils_1.checkForInput)(this.data.inputs, 0);
        range(this.data.inputs.length).forEach((idx) => this.finalizeInput(idx));
        return this;
      }
      finalizeInput(inputIndex, finalScriptsFunc) {
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        if ((0, bip371_1.isTaprootInput)(input))
          return this._finalizeTaprootInput(
            inputIndex,
            input,
            void 0,
            finalScriptsFunc
          );
        return this._finalizeInput(inputIndex, input, finalScriptsFunc);
      }
      finalizeTaprootInput(inputIndex, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        if ((0, bip371_1.isTaprootInput)(input))
          return this._finalizeTaprootInput(
            inputIndex,
            input,
            tapLeafHashToFinalize,
            finalScriptsFunc
          );
        throw new Error(`Cannot finalize input #${inputIndex}. Not Taproot.`);
      }
      _finalizeInput(inputIndex, input, finalScriptsFunc = getFinalScripts) {
        const { script: script2, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(
          inputIndex,
          input,
          this.__CACHE
        );
        if (!script2) throw new Error(`No script found for input #${inputIndex}`);
        checkPartialSigSighashes(input);
        const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(
          inputIndex,
          input,
          script2,
          isSegwit,
          isP2SH,
          isP2WSH
        );
        if (finalScriptSig) this.data.updateInput(inputIndex, { finalScriptSig });
        if (finalScriptWitness)
          this.data.updateInput(inputIndex, { finalScriptWitness });
        if (!finalScriptSig && !finalScriptWitness)
          throw new Error(`Unknown error finalizing input #${inputIndex}`);
        this.data.clearFinalizedInput(inputIndex);
        return this;
      }
      _finalizeTaprootInput(inputIndex, input, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
        if (!input.witnessUtxo)
          throw new Error(
            `Cannot finalize input #${inputIndex}. Missing withness utxo.`
          );
        if (input.tapKeySig) {
          const payment = payments.p2tr({
            output: input.witnessUtxo.script,
            signature: input.tapKeySig
          });
          const finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
            payment.witness
          );
          this.data.updateInput(inputIndex, { finalScriptWitness });
        } else {
          const { finalScriptWitness } = finalScriptsFunc(
            inputIndex,
            input,
            tapLeafHashToFinalize
          );
          this.data.updateInput(inputIndex, { finalScriptWitness });
        }
        this.data.clearFinalizedInput(inputIndex);
        return this;
      }
      getInputType(inputIndex) {
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        const script2 = getScriptFromUtxo(inputIndex, input, this.__CACHE);
        const result = getMeaningfulScript(
          script2,
          inputIndex,
          "input",
          input.redeemScript || redeemFromFinalScriptSig(input.finalScriptSig),
          input.witnessScript || redeemFromFinalWitnessScript(input.finalScriptWitness)
        );
        const type = result.type === "raw" ? "" : result.type + "-";
        const mainType = classifyScript(result.meaningfulScript);
        return type + mainType;
      }
      inputHasPubkey(inputIndex, pubkey) {
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        return pubkeyInInput(pubkey, input, inputIndex, this.__CACHE);
      }
      inputHasHDKey(inputIndex, root) {
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        const derivationIsMine = bip32DerivationIsMine(root);
        return !!input.bip32Derivation && input.bip32Derivation.some(derivationIsMine);
      }
      outputHasPubkey(outputIndex, pubkey) {
        const output = (0, utils_1.checkForOutput)(this.data.outputs, outputIndex);
        return pubkeyInOutput(pubkey, output, outputIndex, this.__CACHE);
      }
      outputHasHDKey(outputIndex, root) {
        const output = (0, utils_1.checkForOutput)(this.data.outputs, outputIndex);
        const derivationIsMine = bip32DerivationIsMine(root);
        return !!output.bip32Derivation && output.bip32Derivation.some(derivationIsMine);
      }
      validateSignaturesOfAllInputs(validator) {
        (0, utils_1.checkForInput)(this.data.inputs, 0);
        const results = range(this.data.inputs.length).map(
          (idx) => this.validateSignaturesOfInput(idx, validator)
        );
        return results.reduce((final, res) => res === true && final, true);
      }
      validateSignaturesOfInput(inputIndex, validator, pubkey) {
        const input = this.data.inputs[inputIndex];
        if ((0, bip371_1.isTaprootInput)(input))
          return this.validateSignaturesOfTaprootInput(
            inputIndex,
            validator,
            pubkey
          );
        return this._validateSignaturesOfInput(inputIndex, validator, pubkey);
      }
      _validateSignaturesOfInput(inputIndex, validator, pubkey) {
        const input = this.data.inputs[inputIndex];
        const partialSig = (input || {}).partialSig;
        if (!input || !partialSig || partialSig.length < 1)
          throw new Error("No signatures to validate");
        if (typeof validator !== "function")
          throw new Error("Need validator function to validate signatures");
        const mySigs = pubkey ? partialSig.filter((sig) => sig.pubkey.equals(pubkey)) : partialSig;
        if (mySigs.length < 1) throw new Error("No signatures for this pubkey");
        const results = [];
        let hashCache;
        let scriptCache;
        let sighashCache;
        for (const pSig of mySigs) {
          const sig = bscript.signature.decode(pSig.signature);
          const { hash, script: script2 } = sighashCache !== sig.hashType ? getHashForSig(
            inputIndex,
            Object.assign({}, input, { sighashType: sig.hashType }),
            this.__CACHE,
            true
          ) : { hash: hashCache, script: scriptCache };
          sighashCache = sig.hashType;
          hashCache = hash;
          scriptCache = script2;
          checkScriptForPubkey(pSig.pubkey, script2, "verify");
          results.push(validator(pSig.pubkey, hash, sig.signature));
        }
        return results.every((res) => res === true);
      }
      validateSignaturesOfTaprootInput(inputIndex, validator, pubkey) {
        const input = this.data.inputs[inputIndex];
        const tapKeySig = (input || {}).tapKeySig;
        const tapScriptSig = (input || {}).tapScriptSig;
        if (!input && !tapKeySig && !(tapScriptSig && !tapScriptSig.length))
          throw new Error("No signatures to validate");
        if (typeof validator !== "function")
          throw new Error("Need validator function to validate signatures");
        pubkey = pubkey && (0, bip371_1.toXOnly)(pubkey);
        const allHashses = pubkey ? getTaprootHashesForSig(
          inputIndex,
          input,
          this.data.inputs,
          pubkey,
          this.__CACHE
        ) : getAllTaprootHashesForSig(
          inputIndex,
          input,
          this.data.inputs,
          this.__CACHE
        );
        if (!allHashses.length) throw new Error("No signatures for this pubkey");
        const tapKeyHash = allHashses.find((h2) => !h2.leafHash);
        let validationResultCount = 0;
        if (tapKeySig && tapKeyHash) {
          const isValidTapkeySig = validator(
            tapKeyHash.pubkey,
            tapKeyHash.hash,
            trimTaprootSig(tapKeySig)
          );
          if (!isValidTapkeySig) return false;
          validationResultCount++;
        }
        if (tapScriptSig) {
          for (const tapSig of tapScriptSig) {
            const tapSigHash = allHashses.find((h2) => tapSig.pubkey.equals(h2.pubkey));
            if (tapSigHash) {
              const isValidTapScriptSig = validator(
                tapSig.pubkey,
                tapSigHash.hash,
                trimTaprootSig(tapSig.signature)
              );
              if (!isValidTapScriptSig) return false;
              validationResultCount++;
            }
          }
        }
        return validationResultCount > 0;
      }
      signAllInputsHD(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
          throw new Error("Need HDSigner to sign input");
        }
        const results = [];
        for (const i of range(this.data.inputs.length)) {
          try {
            this.signInputHD(i, hdKeyPair, sighashTypes);
            results.push(true);
          } catch (err) {
            results.push(false);
          }
        }
        if (results.every((v) => v === false)) {
          throw new Error("No inputs were signed");
        }
        return this;
      }
      signAllInputsHDAsync(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        return new Promise((resolve, reject) => {
          if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            return reject(new Error("Need HDSigner to sign input"));
          }
          const results = [];
          const promises = [];
          for (const i of range(this.data.inputs.length)) {
            promises.push(
              this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(
                () => {
                  results.push(true);
                },
                () => {
                  results.push(false);
                }
              )
            );
          }
          return Promise.all(promises).then(() => {
            if (results.every((v) => v === false)) {
              return reject(new Error("No inputs were signed"));
            }
            resolve();
          });
        });
      }
      signInputHD(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
          throw new Error("Need HDSigner to sign input");
        }
        const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
        signers.forEach((signer) => this.signInput(inputIndex, signer, sighashTypes));
        return this;
      }
      signInputHDAsync(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        return new Promise((resolve, reject) => {
          if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            return reject(new Error("Need HDSigner to sign input"));
          }
          const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
          const promises = signers.map(
            (signer) => this.signInputAsync(inputIndex, signer, sighashTypes)
          );
          return Promise.all(promises).then(() => {
            resolve();
          }).catch(reject);
        });
      }
      signAllInputs(keyPair, sighashTypes) {
        if (!keyPair || !keyPair.publicKey)
          throw new Error("Need Signer to sign input");
        const results = [];
        for (const i of range(this.data.inputs.length)) {
          try {
            this.signInput(i, keyPair, sighashTypes);
            results.push(true);
          } catch (err) {
            results.push(false);
          }
        }
        if (results.every((v) => v === false)) {
          throw new Error("No inputs were signed");
        }
        return this;
      }
      signAllInputsAsync(keyPair, sighashTypes) {
        return new Promise((resolve, reject) => {
          if (!keyPair || !keyPair.publicKey)
            return reject(new Error("Need Signer to sign input"));
          const results = [];
          const promises = [];
          for (const [i] of this.data.inputs.entries()) {
            promises.push(
              this.signInputAsync(i, keyPair, sighashTypes).then(
                () => {
                  results.push(true);
                },
                () => {
                  results.push(false);
                }
              )
            );
          }
          return Promise.all(promises).then(() => {
            if (results.every((v) => v === false)) {
              return reject(new Error("No inputs were signed"));
            }
            resolve();
          });
        });
      }
      signInput(inputIndex, keyPair, sighashTypes) {
        if (!keyPair || !keyPair.publicKey)
          throw new Error("Need Signer to sign input");
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        if ((0, bip371_1.isTaprootInput)(input)) {
          return this._signTaprootInput(
            inputIndex,
            input,
            keyPair,
            void 0,
            sighashTypes
          );
        }
        return this._signInput(inputIndex, keyPair, sighashTypes);
      }
      signTaprootInput(inputIndex, keyPair, tapLeafHashToSign, sighashTypes) {
        if (!keyPair || !keyPair.publicKey)
          throw new Error("Need Signer to sign input");
        const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
        if ((0, bip371_1.isTaprootInput)(input))
          return this._signTaprootInput(
            inputIndex,
            input,
            keyPair,
            tapLeafHashToSign,
            sighashTypes
          );
        throw new Error(`Input #${inputIndex} is not of type Taproot.`);
      }
      _signInput(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        const { hash, sighashType } = getHashAndSighashType(
          this.data.inputs,
          inputIndex,
          keyPair.publicKey,
          this.__CACHE,
          sighashTypes
        );
        const partialSig = [
          {
            pubkey: keyPair.publicKey,
            signature: bscript.signature.encode(keyPair.sign(hash), sighashType)
          }
        ];
        this.data.updateInput(inputIndex, { partialSig });
        return this;
      }
      _signTaprootInput(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
        const hashesForSig = this.checkTaprootHashesForSig(
          inputIndex,
          input,
          keyPair,
          tapLeafHashToSign,
          allowedSighashTypes
        );
        const tapKeySig = hashesForSig.filter((h2) => !h2.leafHash).map(
          (h2) => (0, bip371_1.serializeTaprootSignature)(
            keyPair.signSchnorr(h2.hash),
            input.sighashType
          )
        )[0];
        const tapScriptSig = hashesForSig.filter((h2) => !!h2.leafHash).map((h2) => ({
          pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
          signature: (0, bip371_1.serializeTaprootSignature)(
            keyPair.signSchnorr(h2.hash),
            input.sighashType
          ),
          leafHash: h2.leafHash
        }));
        if (tapKeySig) {
          this.data.updateInput(inputIndex, { tapKeySig });
        }
        if (tapScriptSig.length) {
          this.data.updateInput(inputIndex, { tapScriptSig });
        }
        return this;
      }
      signInputAsync(inputIndex, keyPair, sighashTypes) {
        return Promise.resolve().then(() => {
          if (!keyPair || !keyPair.publicKey)
            throw new Error("Need Signer to sign input");
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input))
            return this._signTaprootInputAsync(
              inputIndex,
              input,
              keyPair,
              void 0,
              sighashTypes
            );
          return this._signInputAsync(inputIndex, keyPair, sighashTypes);
        });
      }
      signTaprootInputAsync(inputIndex, keyPair, tapLeafHash, sighashTypes) {
        return Promise.resolve().then(() => {
          if (!keyPair || !keyPair.publicKey)
            throw new Error("Need Signer to sign input");
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input))
            return this._signTaprootInputAsync(
              inputIndex,
              input,
              keyPair,
              tapLeafHash,
              sighashTypes
            );
          throw new Error(`Input #${inputIndex} is not of type Taproot.`);
        });
      }
      _signInputAsync(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
        const { hash, sighashType } = getHashAndSighashType(
          this.data.inputs,
          inputIndex,
          keyPair.publicKey,
          this.__CACHE,
          sighashTypes
        );
        return Promise.resolve(keyPair.sign(hash)).then((signature) => {
          const partialSig = [
            {
              pubkey: keyPair.publicKey,
              signature: bscript.signature.encode(signature, sighashType)
            }
          ];
          this.data.updateInput(inputIndex, { partialSig });
        });
      }
      async _signTaprootInputAsync(inputIndex, input, keyPair, tapLeafHash, sighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
        const hashesForSig = this.checkTaprootHashesForSig(
          inputIndex,
          input,
          keyPair,
          tapLeafHash,
          sighashTypes
        );
        const signaturePromises = [];
        const tapKeyHash = hashesForSig.filter((h2) => !h2.leafHash)[0];
        if (tapKeyHash) {
          const tapKeySigPromise = Promise.resolve(
            keyPair.signSchnorr(tapKeyHash.hash)
          ).then((sig) => {
            return {
              tapKeySig: (0, bip371_1.serializeTaprootSignature)(
                sig,
                input.sighashType
              )
            };
          });
          signaturePromises.push(tapKeySigPromise);
        }
        const tapScriptHashes = hashesForSig.filter((h2) => !!h2.leafHash);
        if (tapScriptHashes.length) {
          const tapScriptSigPromises = tapScriptHashes.map((tsh) => {
            return Promise.resolve(keyPair.signSchnorr(tsh.hash)).then(
              (signature) => {
                const tapScriptSig = [
                  {
                    pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
                    signature: (0, bip371_1.serializeTaprootSignature)(
                      signature,
                      input.sighashType
                    ),
                    leafHash: tsh.leafHash
                  }
                ];
                return { tapScriptSig };
              }
            );
          });
          signaturePromises.push(...tapScriptSigPromises);
        }
        return Promise.all(signaturePromises).then((results) => {
          results.forEach((v) => this.data.updateInput(inputIndex, v));
        });
      }
      checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes) {
        if (typeof keyPair.signSchnorr !== "function")
          throw new Error(
            `Need Schnorr Signer to sign taproot input #${inputIndex}.`
          );
        const hashesForSig = getTaprootHashesForSig(
          inputIndex,
          input,
          this.data.inputs,
          keyPair.publicKey,
          this.__CACHE,
          tapLeafHashToSign,
          allowedSighashTypes
        );
        if (!hashesForSig || !hashesForSig.length)
          throw new Error(
            `Can not sign for input #${inputIndex} with the key ${keyPair.publicKey.toString(
              "hex"
            )}`
          );
        return hashesForSig;
      }
      toBuffer() {
        checkCache(this.__CACHE);
        return this.data.toBuffer();
      }
      toHex() {
        checkCache(this.__CACHE);
        return this.data.toHex();
      }
      toBase64() {
        checkCache(this.__CACHE);
        return this.data.toBase64();
      }
      updateGlobal(updateData) {
        this.data.updateGlobal(updateData);
        return this;
      }
      updateInput(inputIndex, updateData) {
        if (updateData.witnessScript) checkInvalidP2WSH(updateData.witnessScript);
        (0, bip371_1.checkTaprootInputFields)(
          this.data.inputs[inputIndex],
          updateData,
          "updateInput"
        );
        this.data.updateInput(inputIndex, updateData);
        if (updateData.nonWitnessUtxo) {
          addNonWitnessTxCache(
            this.__CACHE,
            this.data.inputs[inputIndex],
            inputIndex
          );
        }
        return this;
      }
      updateOutput(outputIndex, updateData) {
        const outputData = this.data.outputs[outputIndex];
        (0, bip371_1.checkTaprootOutputFields)(
          outputData,
          updateData,
          "updateOutput"
        );
        this.data.updateOutput(outputIndex, updateData);
        return this;
      }
      addUnknownKeyValToGlobal(keyVal) {
        this.data.addUnknownKeyValToGlobal(keyVal);
        return this;
      }
      addUnknownKeyValToInput(inputIndex, keyVal) {
        this.data.addUnknownKeyValToInput(inputIndex, keyVal);
        return this;
      }
      addUnknownKeyValToOutput(outputIndex, keyVal) {
        this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
        return this;
      }
      clearFinalizedInput(inputIndex) {
        this.data.clearFinalizedInput(inputIndex);
        return this;
      }
    };
    exports2.Psbt = Psbt;
    var transactionFromBuffer = (buffer) => new PsbtTransaction(buffer);
    var PsbtTransaction = class {
      constructor(buffer = Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
        this.tx = transaction_1.Transaction.fromBuffer(buffer);
        checkTxEmpty(this.tx);
        Object.defineProperty(this, "tx", {
          enumerable: false,
          writable: true
        });
      }
      getInputOutputCounts() {
        return {
          inputCount: this.tx.ins.length,
          outputCount: this.tx.outs.length
        };
      }
      addInput(input) {
        if (input.hash === void 0 || input.index === void 0 || !Buffer.isBuffer(input.hash) && typeof input.hash !== "string" || typeof input.index !== "number") {
          throw new Error("Error adding input.");
        }
        const hash = typeof input.hash === "string" ? (0, bufferutils_1.reverseBuffer)(Buffer.from(input.hash, "hex")) : input.hash;
        this.tx.addInput(hash, input.index, input.sequence);
      }
      addOutput(output) {
        if (output.script === void 0 || output.value === void 0 || !Buffer.isBuffer(output.script) || typeof output.value !== "number") {
          throw new Error("Error adding output.");
        }
        this.tx.addOutput(output.script, output.value);
      }
      toBuffer() {
        return this.tx.toBuffer();
      }
    };
    function canFinalize(input, script2, scriptType) {
      switch (scriptType) {
        case "pubkey":
        case "pubkeyhash":
        case "witnesspubkeyhash":
          return hasSigs(1, input.partialSig);
        case "multisig":
          const p2ms = payments.p2ms({ output: script2 });
          return hasSigs(p2ms.m, input.partialSig, p2ms.pubkeys);
        default:
          return false;
      }
    }
    function checkCache(cache) {
      if (cache.__UNSAFE_SIGN_NONSEGWIT !== false) {
        throw new Error("Not BIP174 compliant, can not export");
      }
    }
    function hasSigs(neededSigs, partialSig, pubkeys) {
      if (!partialSig) return false;
      let sigs;
      if (pubkeys) {
        sigs = pubkeys.map((pkey) => {
          const pubkey = compressPubkey(pkey);
          return partialSig.find((pSig) => pSig.pubkey.equals(pubkey));
        }).filter((v) => !!v);
      } else {
        sigs = partialSig;
      }
      if (sigs.length > neededSigs) throw new Error("Too many signatures");
      return sigs.length === neededSigs;
    }
    function isFinalized(input) {
      return !!input.finalScriptSig || !!input.finalScriptWitness;
    }
    function bip32DerivationIsMine(root) {
      return (d) => {
        if (!d.masterFingerprint.equals(root.fingerprint)) return false;
        if (!root.derivePath(d.path).publicKey.equals(d.pubkey)) return false;
        return true;
      };
    }
    function check32Bit(num) {
      if (typeof num !== "number" || num !== Math.floor(num) || num > 4294967295 || num < 0) {
        throw new Error("Invalid 32 bit integer");
      }
    }
    function checkFees(psbt, cache, opts) {
      const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
      const vsize = cache.__EXTRACTED_TX.virtualSize();
      const satoshis = feeRate * vsize;
      if (feeRate >= opts.maximumFeeRate) {
        throw new Error(
          `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in fees, which is ${feeRate} satoshi per byte for a transaction with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per byte). Use setMaximumFeeRate method to raise your threshold, or pass true to the first arg of extractTransaction.`
        );
      }
    }
    function checkInputsForPartialSig(inputs, action) {
      inputs.forEach((input) => {
        const throws = (0, bip371_1.isTaprootInput)(input) ? (0, bip371_1.checkTaprootInputForSigs)(input, action) : (0, psbtutils_1.checkInputForSig)(input, action);
        if (throws)
          throw new Error("Can not modify transaction, signatures exist.");
      });
    }
    function checkPartialSigSighashes(input) {
      if (!input.sighashType || !input.partialSig) return;
      const { partialSig, sighashType } = input;
      partialSig.forEach((pSig) => {
        const { hashType } = bscript.signature.decode(pSig.signature);
        if (sighashType !== hashType) {
          throw new Error("Signature sighash does not match input sighash type");
        }
      });
    }
    function checkScriptForPubkey(pubkey, script2, action) {
      if (!(0, psbtutils_1.pubkeyInScript)(pubkey, script2)) {
        throw new Error(
          `Can not ${action} for this input with the key ${pubkey.toString("hex")}`
        );
      }
    }
    function checkTxEmpty(tx) {
      const isEmpty = tx.ins.every(
        (input) => input.script && input.script.length === 0 && input.witness && input.witness.length === 0
      );
      if (!isEmpty) {
        throw new Error("Format Error: Transaction ScriptSigs are not empty");
      }
    }
    function checkTxForDupeIns(tx, cache) {
      tx.ins.forEach((input) => {
        checkTxInputCache(cache, input);
      });
    }
    function checkTxInputCache(cache, input) {
      const key = (0, bufferutils_1.reverseBuffer)(Buffer.from(input.hash)).toString("hex") + ":" + input.index;
      if (cache.__TX_IN_CACHE[key]) throw new Error("Duplicate input detected.");
      cache.__TX_IN_CACHE[key] = 1;
    }
    function scriptCheckerFactory(payment, paymentScriptName) {
      return (inputIndex, scriptPubKey, redeemScript, ioType) => {
        const redeemScriptOutput = payment({
          redeem: { output: redeemScript }
        }).output;
        if (!scriptPubKey.equals(redeemScriptOutput)) {
          throw new Error(
            `${paymentScriptName} for ${ioType} #${inputIndex} doesn't match the scriptPubKey in the prevout`
          );
        }
      };
    }
    var checkRedeemScript = scriptCheckerFactory(payments.p2sh, "Redeem script");
    var checkWitnessScript = scriptCheckerFactory(
      payments.p2wsh,
      "Witness script"
    );
    function getTxCacheValue(key, name, inputs, c) {
      if (!inputs.every(isFinalized))
        throw new Error(`PSBT must be finalized to calculate ${name}`);
      if (key === "__FEE_RATE" && c.__FEE_RATE) return c.__FEE_RATE;
      if (key === "__FEE" && c.__FEE) return c.__FEE;
      let tx;
      let mustFinalize = true;
      if (c.__EXTRACTED_TX) {
        tx = c.__EXTRACTED_TX;
        mustFinalize = false;
      } else {
        tx = c.__TX.clone();
      }
      inputFinalizeGetAmts(inputs, tx, c, mustFinalize);
      if (key === "__FEE_RATE") return c.__FEE_RATE;
      else if (key === "__FEE") return c.__FEE;
    }
    function getFinalScripts(inputIndex, input, script2, isSegwit, isP2SH, isP2WSH) {
      const scriptType = classifyScript(script2);
      if (!canFinalize(input, script2, scriptType))
        throw new Error(`Can not finalize input #${inputIndex}`);
      return prepareFinalScripts(
        script2,
        scriptType,
        input.partialSig,
        isSegwit,
        isP2SH,
        isP2WSH
      );
    }
    function prepareFinalScripts(script2, scriptType, partialSig, isSegwit, isP2SH, isP2WSH) {
      let finalScriptSig;
      let finalScriptWitness;
      const payment = getPayment(script2, scriptType, partialSig);
      const p2wsh = !isP2WSH ? null : payments.p2wsh({ redeem: payment });
      const p2sh = !isP2SH ? null : payments.p2sh({ redeem: p2wsh || payment });
      if (isSegwit) {
        if (p2wsh) {
          finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
            p2wsh.witness
          );
        } else {
          finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
            payment.witness
          );
        }
        if (p2sh) {
          finalScriptSig = p2sh.input;
        }
      } else {
        if (p2sh) {
          finalScriptSig = p2sh.input;
        } else {
          finalScriptSig = payment.input;
        }
      }
      return {
        finalScriptSig,
        finalScriptWitness
      };
    }
    function getHashAndSighashType(inputs, inputIndex, pubkey, cache, sighashTypes) {
      const input = (0, utils_1.checkForInput)(inputs, inputIndex);
      const { hash, sighashType, script: script2 } = getHashForSig(
        inputIndex,
        input,
        cache,
        false,
        sighashTypes
      );
      checkScriptForPubkey(pubkey, script2, "sign");
      return {
        hash,
        sighashType
      };
    }
    function getHashForSig(inputIndex, input, cache, forValidate, sighashTypes) {
      const unsignedTx = cache.__TX;
      const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_ALL;
      checkSighashTypeAllowed(sighashType, sighashTypes);
      let hash;
      let prevout;
      if (input.nonWitnessUtxo) {
        const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
          cache,
          input,
          inputIndex
        );
        const prevoutHash = unsignedTx.ins[inputIndex].hash;
        const utxoHash = nonWitnessUtxoTx.getHash();
        if (!prevoutHash.equals(utxoHash)) {
          throw new Error(
            `Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`
          );
        }
        const prevoutIndex = unsignedTx.ins[inputIndex].index;
        prevout = nonWitnessUtxoTx.outs[prevoutIndex];
      } else if (input.witnessUtxo) {
        prevout = input.witnessUtxo;
      } else {
        throw new Error("Need a Utxo input item for signing");
      }
      const { meaningfulScript, type } = getMeaningfulScript(
        prevout.script,
        inputIndex,
        "input",
        input.redeemScript,
        input.witnessScript
      );
      if (["p2sh-p2wsh", "p2wsh"].indexOf(type) >= 0) {
        hash = unsignedTx.hashForWitnessV0(
          inputIndex,
          meaningfulScript,
          prevout.value,
          sighashType
        );
      } else if ((0, psbtutils_1.isP2WPKH)(meaningfulScript)) {
        const signingScript = payments.p2pkh({
          hash: meaningfulScript.slice(2)
        }).output;
        hash = unsignedTx.hashForWitnessV0(
          inputIndex,
          signingScript,
          prevout.value,
          sighashType
        );
      } else {
        if (input.nonWitnessUtxo === void 0 && cache.__UNSAFE_SIGN_NONSEGWIT === false)
          throw new Error(
            `Input #${inputIndex} has witnessUtxo but non-segwit script: ${meaningfulScript.toString("hex")}`
          );
        if (!forValidate && cache.__UNSAFE_SIGN_NONSEGWIT !== false)
          console.warn(
            "Warning: Signing non-segwit inputs without the full parent transaction means there is a chance that a miner could feed you incorrect information to trick you into paying large fees. This behavior is the same as Psbt's predecessor (TransactionBuilder - now removed) when signing non-segwit scripts. You are not able to export this Psbt with toBuffer|toBase64|toHex since it is not BIP174 compliant.\n*********************\nPROCEED WITH CAUTION!\n*********************"
          );
        hash = unsignedTx.hashForSignature(
          inputIndex,
          meaningfulScript,
          sighashType
        );
      }
      return {
        script: meaningfulScript,
        sighashType,
        hash
      };
    }
    function getAllTaprootHashesForSig(inputIndex, input, inputs, cache) {
      const allPublicKeys = [];
      if (input.tapInternalKey) {
        const key = getPrevoutTaprootKey(inputIndex, input, cache);
        if (key) {
          allPublicKeys.push(key);
        }
      }
      if (input.tapScriptSig) {
        const tapScriptPubkeys = input.tapScriptSig.map((tss) => tss.pubkey);
        allPublicKeys.push(...tapScriptPubkeys);
      }
      const allHashes = allPublicKeys.map(
        (pubicKey) => getTaprootHashesForSig(inputIndex, input, inputs, pubicKey, cache)
      );
      return allHashes.flat();
    }
    function getPrevoutTaprootKey(inputIndex, input, cache) {
      const { script: script2 } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
      return (0, psbtutils_1.isP2TR)(script2) ? script2.subarray(2, 34) : null;
    }
    function trimTaprootSig(signature) {
      return signature.length === 64 ? signature : signature.subarray(0, 64);
    }
    function getTaprootHashesForSig(inputIndex, input, inputs, pubkey, cache, tapLeafHashToSign, allowedSighashTypes) {
      const unsignedTx = cache.__TX;
      const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_DEFAULT;
      checkSighashTypeAllowed(sighashType, allowedSighashTypes);
      const prevOuts = inputs.map(
        (i, index) => getScriptAndAmountFromUtxo(index, i, cache)
      );
      const signingScripts = prevOuts.map((o) => o.script);
      const values = prevOuts.map((o) => o.value);
      const hashes = [];
      if (input.tapInternalKey && !tapLeafHashToSign) {
        const outputKey = getPrevoutTaprootKey(inputIndex, input, cache) || Buffer.from([]);
        if ((0, bip371_1.toXOnly)(pubkey).equals(outputKey)) {
          const tapKeyHash = unsignedTx.hashForWitnessV1(
            inputIndex,
            signingScripts,
            values,
            sighashType
          );
          hashes.push({ pubkey, hash: tapKeyHash });
        }
      }
      const tapLeafHashes = (input.tapLeafScript || []).filter((tapLeaf) => (0, psbtutils_1.pubkeyInScript)(pubkey, tapLeaf.script)).map((tapLeaf) => {
        const hash = (0, bip341_1.tapleafHash)({
          output: tapLeaf.script,
          version: tapLeaf.leafVersion
        });
        return Object.assign({ hash }, tapLeaf);
      }).filter(
        (tapLeaf) => !tapLeafHashToSign || tapLeafHashToSign.equals(tapLeaf.hash)
      ).map((tapLeaf) => {
        const tapScriptHash = unsignedTx.hashForWitnessV1(
          inputIndex,
          signingScripts,
          values,
          sighashType,
          tapLeaf.hash
        );
        return {
          pubkey,
          hash: tapScriptHash,
          leafHash: tapLeaf.hash
        };
      });
      return hashes.concat(tapLeafHashes);
    }
    function checkSighashTypeAllowed(sighashType, sighashTypes) {
      if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
        const str = sighashTypeToString(sighashType);
        throw new Error(
          `Sighash type is not allowed. Retry the sign method passing the sighashTypes array of whitelisted types. Sighash type: ${str}`
        );
      }
    }
    function getPayment(script2, scriptType, partialSig) {
      let payment;
      switch (scriptType) {
        case "multisig":
          const sigs = getSortedSigs(script2, partialSig);
          payment = payments.p2ms({
            output: script2,
            signatures: sigs
          });
          break;
        case "pubkey":
          payment = payments.p2pk({
            output: script2,
            signature: partialSig[0].signature
          });
          break;
        case "pubkeyhash":
          payment = payments.p2pkh({
            output: script2,
            pubkey: partialSig[0].pubkey,
            signature: partialSig[0].signature
          });
          break;
        case "witnesspubkeyhash":
          payment = payments.p2wpkh({
            output: script2,
            pubkey: partialSig[0].pubkey,
            signature: partialSig[0].signature
          });
          break;
      }
      return payment;
    }
    function getScriptFromInput(inputIndex, input, cache) {
      const unsignedTx = cache.__TX;
      const res = {
        script: null,
        isSegwit: false,
        isP2SH: false,
        isP2WSH: false
      };
      res.isP2SH = !!input.redeemScript;
      res.isP2WSH = !!input.witnessScript;
      if (input.witnessScript) {
        res.script = input.witnessScript;
      } else if (input.redeemScript) {
        res.script = input.redeemScript;
      } else {
        if (input.nonWitnessUtxo) {
          const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
            cache,
            input,
            inputIndex
          );
          const prevoutIndex = unsignedTx.ins[inputIndex].index;
          res.script = nonWitnessUtxoTx.outs[prevoutIndex].script;
        } else if (input.witnessUtxo) {
          res.script = input.witnessUtxo.script;
        }
      }
      if (input.witnessScript || (0, psbtutils_1.isP2WPKH)(res.script)) {
        res.isSegwit = true;
      }
      return res;
    }
    function getSignersFromHD(inputIndex, inputs, hdKeyPair) {
      const input = (0, utils_1.checkForInput)(inputs, inputIndex);
      if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
        throw new Error("Need bip32Derivation to sign with HD");
      }
      const myDerivations = input.bip32Derivation.map((bipDv) => {
        if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) {
          return bipDv;
        } else {
          return;
        }
      }).filter((v) => !!v);
      if (myDerivations.length === 0) {
        throw new Error(
          "Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint"
        );
      }
      const signers = myDerivations.map((bipDv) => {
        const node = hdKeyPair.derivePath(bipDv.path);
        if (!bipDv.pubkey.equals(node.publicKey)) {
          throw new Error("pubkey did not match bip32Derivation");
        }
        return node;
      });
      return signers;
    }
    function getSortedSigs(script2, partialSig) {
      const p2ms = payments.p2ms({ output: script2 });
      return p2ms.pubkeys.map((pk) => {
        return (partialSig.filter((ps) => {
          return ps.pubkey.equals(pk);
        })[0] || {}).signature;
      }).filter((v) => !!v);
    }
    function scriptWitnessToWitnessStack(buffer) {
      let offset = 0;
      function readSlice(n) {
        offset += n;
        return buffer.slice(offset - n, offset);
      }
      function readVarInt() {
        const vi = varuint.decode(buffer, offset);
        offset += varuint.decode.bytes;
        return vi;
      }
      function readVarSlice() {
        return readSlice(readVarInt());
      }
      function readVector() {
        const count = readVarInt();
        const vector = [];
        for (let i = 0; i < count; i++) vector.push(readVarSlice());
        return vector;
      }
      return readVector();
    }
    function sighashTypeToString(sighashType) {
      let text = sighashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY ? "SIGHASH_ANYONECANPAY | " : "";
      const sigMod = sighashType & 31;
      switch (sigMod) {
        case transaction_1.Transaction.SIGHASH_ALL:
          text += "SIGHASH_ALL";
          break;
        case transaction_1.Transaction.SIGHASH_SINGLE:
          text += "SIGHASH_SINGLE";
          break;
        case transaction_1.Transaction.SIGHASH_NONE:
          text += "SIGHASH_NONE";
          break;
      }
      return text;
    }
    function addNonWitnessTxCache(cache, input, inputIndex) {
      cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo;
      const tx = transaction_1.Transaction.fromBuffer(input.nonWitnessUtxo);
      cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;
      const self = cache;
      const selfIndex = inputIndex;
      delete input.nonWitnessUtxo;
      Object.defineProperty(input, "nonWitnessUtxo", {
        enumerable: true,
        get() {
          const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
          const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
          if (buf !== void 0) {
            return buf;
          } else {
            const newBuf = txCache.toBuffer();
            self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
            return newBuf;
          }
        },
        set(data) {
          self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
        }
      });
    }
    function inputFinalizeGetAmts(inputs, tx, cache, mustFinalize) {
      let inputAmount = 0;
      inputs.forEach((input, idx) => {
        if (mustFinalize && input.finalScriptSig)
          tx.ins[idx].script = input.finalScriptSig;
        if (mustFinalize && input.finalScriptWitness) {
          tx.ins[idx].witness = scriptWitnessToWitnessStack(
            input.finalScriptWitness
          );
        }
        if (input.witnessUtxo) {
          inputAmount += input.witnessUtxo.value;
        } else if (input.nonWitnessUtxo) {
          const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx);
          const vout = tx.ins[idx].index;
          const out = nwTx.outs[vout];
          inputAmount += out.value;
        }
      });
      const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0);
      const fee = inputAmount - outputAmount;
      if (fee < 0) {
        throw new Error("Outputs are spending more than Inputs");
      }
      const bytes = tx.virtualSize();
      cache.__FEE = fee;
      cache.__EXTRACTED_TX = tx;
      cache.__FEE_RATE = Math.floor(fee / bytes);
    }
    function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
      const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
      if (!c[inputIndex]) {
        addNonWitnessTxCache(cache, input, inputIndex);
      }
      return c[inputIndex];
    }
    function getScriptFromUtxo(inputIndex, input, cache) {
      const { script: script2 } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
      return script2;
    }
    function getScriptAndAmountFromUtxo(inputIndex, input, cache) {
      if (input.witnessUtxo !== void 0) {
        return {
          script: input.witnessUtxo.script,
          value: input.witnessUtxo.value
        };
      } else if (input.nonWitnessUtxo !== void 0) {
        const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
          cache,
          input,
          inputIndex
        );
        const o = nonWitnessUtxoTx.outs[cache.__TX.ins[inputIndex].index];
        return { script: o.script, value: o.value };
      } else {
        throw new Error("Can't find pubkey in input without Utxo data");
      }
    }
    function pubkeyInInput(pubkey, input, inputIndex, cache) {
      const script2 = getScriptFromUtxo(inputIndex, input, cache);
      const { meaningfulScript } = getMeaningfulScript(
        script2,
        inputIndex,
        "input",
        input.redeemScript,
        input.witnessScript
      );
      return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
    }
    function pubkeyInOutput(pubkey, output, outputIndex, cache) {
      const script2 = cache.__TX.outs[outputIndex].script;
      const { meaningfulScript } = getMeaningfulScript(
        script2,
        outputIndex,
        "output",
        output.redeemScript,
        output.witnessScript
      );
      return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
    }
    function redeemFromFinalScriptSig(finalScript) {
      if (!finalScript) return;
      const decomp = bscript.decompile(finalScript);
      if (!decomp) return;
      const lastItem = decomp[decomp.length - 1];
      if (!Buffer.isBuffer(lastItem) || isPubkeyLike(lastItem) || isSigLike(lastItem))
        return;
      const sDecomp = bscript.decompile(lastItem);
      if (!sDecomp) return;
      return lastItem;
    }
    function redeemFromFinalWitnessScript(finalScript) {
      if (!finalScript) return;
      const decomp = scriptWitnessToWitnessStack(finalScript);
      const lastItem = decomp[decomp.length - 1];
      if (isPubkeyLike(lastItem)) return;
      const sDecomp = bscript.decompile(lastItem);
      if (!sDecomp) return;
      return lastItem;
    }
    function compressPubkey(pubkey) {
      if (pubkey.length === 65) {
        const parity = pubkey[64] & 1;
        const newKey = pubkey.slice(0, 33);
        newKey[0] = 2 | parity;
        return newKey;
      }
      return pubkey.slice();
    }
    function isPubkeyLike(buf) {
      return buf.length === 33 && bscript.isCanonicalPubKey(buf);
    }
    function isSigLike(buf) {
      return bscript.isCanonicalScriptSignature(buf);
    }
    function getMeaningfulScript(script2, index, ioType, redeemScript, witnessScript) {
      const isP2SH = (0, psbtutils_1.isP2SHScript)(script2);
      const isP2SHP2WSH = isP2SH && redeemScript && (0, psbtutils_1.isP2WSHScript)(redeemScript);
      const isP2WSH = (0, psbtutils_1.isP2WSHScript)(script2);
      if (isP2SH && redeemScript === void 0)
        throw new Error("scriptPubkey is P2SH but redeemScript missing");
      if ((isP2WSH || isP2SHP2WSH) && witnessScript === void 0)
        throw new Error(
          "scriptPubkey or redeemScript is P2WSH but witnessScript missing"
        );
      let meaningfulScript;
      if (isP2SHP2WSH) {
        meaningfulScript = witnessScript;
        checkRedeemScript(index, script2, redeemScript, ioType);
        checkWitnessScript(index, redeemScript, witnessScript, ioType);
        checkInvalidP2WSH(meaningfulScript);
      } else if (isP2WSH) {
        meaningfulScript = witnessScript;
        checkWitnessScript(index, script2, witnessScript, ioType);
        checkInvalidP2WSH(meaningfulScript);
      } else if (isP2SH) {
        meaningfulScript = redeemScript;
        checkRedeemScript(index, script2, redeemScript, ioType);
      } else {
        meaningfulScript = script2;
      }
      return {
        meaningfulScript,
        type: isP2SHP2WSH ? "p2sh-p2wsh" : isP2SH ? "p2sh" : isP2WSH ? "p2wsh" : "raw"
      };
    }
    function checkInvalidP2WSH(script2) {
      if ((0, psbtutils_1.isP2WPKH)(script2) || (0, psbtutils_1.isP2SHScript)(script2)) {
        throw new Error("P2WPKH or P2SH can not be contained within P2WSH");
      }
    }
    function classifyScript(script2) {
      if ((0, psbtutils_1.isP2WPKH)(script2)) return "witnesspubkeyhash";
      if ((0, psbtutils_1.isP2PKH)(script2)) return "pubkeyhash";
      if ((0, psbtutils_1.isP2MS)(script2)) return "multisig";
      if ((0, psbtutils_1.isP2PK)(script2)) return "pubkey";
      return "nonstandard";
    }
    function range(n) {
      return [...Array(n).keys()];
    }
  }
});

// node_modules/bitcoinjs-lib/src/index.js
var require_src2 = __commonJS({
  "node_modules/bitcoinjs-lib/src/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.initEccLib = exports2.Transaction = exports2.opcodes = exports2.Psbt = exports2.Block = exports2.script = exports2.payments = exports2.networks = exports2.crypto = exports2.address = void 0;
    var address = require_address();
    exports2.address = address;
    var crypto2 = require_crypto();
    exports2.crypto = crypto2;
    var networks = require_networks();
    exports2.networks = networks;
    var payments = require_payments();
    exports2.payments = payments;
    var script2 = require_script();
    exports2.script = script2;
    var block_1 = require_block();
    Object.defineProperty(exports2, "Block", {
      enumerable: true,
      get: function() {
        return block_1.Block;
      }
    });
    var psbt_1 = require_psbt2();
    Object.defineProperty(exports2, "Psbt", {
      enumerable: true,
      get: function() {
        return psbt_1.Psbt;
      }
    });
    var ops_1 = require_ops();
    Object.defineProperty(exports2, "opcodes", {
      enumerable: true,
      get: function() {
        return ops_1.OPS;
      }
    });
    var transaction_1 = require_transaction();
    Object.defineProperty(exports2, "Transaction", {
      enumerable: true,
      get: function() {
        return transaction_1.Transaction;
      }
    });
    var ecc_lib_1 = require_ecc_lib();
    Object.defineProperty(exports2, "initEccLib", {
      enumerable: true,
      get: function() {
        return ecc_lib_1.initEccLib;
      }
    });
  }
});

// node_modules/@noble/hashes/hmac.js
var require_hmac = __commonJS({
  "node_modules/@noble/hashes/hmac.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.hmac = exports2.HMAC = void 0;
    var utils_ts_1 = require_utils();
    var HMAC = class extends utils_ts_1.Hash {
      constructor(hash, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        (0, utils_ts_1.ahash)(hash);
        const key = (0, utils_ts_1.toBytes)(_key);
        this.iHash = hash.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54;
        this.iHash.update(pad);
        this.oHash = hash.create();
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54 ^ 92;
        this.oHash.update(pad);
        (0, utils_ts_1.clean)(pad);
      }
      update(buf) {
        (0, utils_ts_1.aexists)(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        (0, utils_ts_1.aexists)(this);
        (0, utils_ts_1.abytes)(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    exports2.HMAC = HMAC;
    var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
    exports2.hmac = hmac;
    exports2.hmac.create = (hash, key) => new HMAC(hash, key);
  }
});

// node_modules/@noble/curves/utils.js
var require_utils3 = __commonJS({
  "node_modules/@noble/curves/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.notImplemented = exports2.bitMask = exports2.utf8ToBytes = exports2.randomBytes = exports2.isBytes = exports2.hexToBytes = exports2.concatBytes = exports2.bytesToUtf8 = exports2.bytesToHex = exports2.anumber = exports2.abytes = void 0;
    exports2.abool = abool2;
    exports2._abool2 = _abool2;
    exports2._abytes2 = _abytes2;
    exports2.numberToHexUnpadded = numberToHexUnpadded;
    exports2.hexToNumber = hexToNumber;
    exports2.bytesToNumberBE = bytesToNumberBE;
    exports2.bytesToNumberLE = bytesToNumberLE;
    exports2.numberToBytesBE = numberToBytesBE;
    exports2.numberToBytesLE = numberToBytesLE;
    exports2.numberToVarBytesBE = numberToVarBytesBE;
    exports2.ensureBytes = ensureBytes;
    exports2.equalBytes = equalBytes2;
    exports2.copyBytes = copyBytes;
    exports2.asciiToBytes = asciiToBytes;
    exports2.inRange = inRange;
    exports2.aInRange = aInRange;
    exports2.bitLen = bitLen;
    exports2.bitGet = bitGet;
    exports2.bitSet = bitSet;
    exports2.createHmacDrbg = createHmacDrbg;
    exports2.validateObject = validateObject;
    exports2.isHash = isHash;
    exports2._validateObject = _validateObject;
    exports2.memoized = memoized;
    var utils_js_1 = require_utils();
    var utils_js_2 = require_utils();
    Object.defineProperty(exports2, "abytes", { enumerable: true, get: function() {
      return utils_js_2.abytes;
    } });
    Object.defineProperty(exports2, "anumber", { enumerable: true, get: function() {
      return utils_js_2.anumber;
    } });
    Object.defineProperty(exports2, "bytesToHex", { enumerable: true, get: function() {
      return utils_js_2.bytesToHex;
    } });
    Object.defineProperty(exports2, "bytesToUtf8", { enumerable: true, get: function() {
      return utils_js_2.bytesToUtf8;
    } });
    Object.defineProperty(exports2, "concatBytes", { enumerable: true, get: function() {
      return utils_js_2.concatBytes;
    } });
    Object.defineProperty(exports2, "hexToBytes", { enumerable: true, get: function() {
      return utils_js_2.hexToBytes;
    } });
    Object.defineProperty(exports2, "isBytes", { enumerable: true, get: function() {
      return utils_js_2.isBytes;
    } });
    Object.defineProperty(exports2, "randomBytes", { enumerable: true, get: function() {
      return utils_js_2.randomBytes;
    } });
    Object.defineProperty(exports2, "utf8ToBytes", { enumerable: true, get: function() {
      return utils_js_2.utf8ToBytes;
    } });
    var _0n2 = /* @__PURE__ */ BigInt(0);
    var _1n2 = /* @__PURE__ */ BigInt(1);
    function abool2(title, value) {
      if (typeof value !== "boolean")
        throw new Error(title + " boolean expected, got " + value);
    }
    function _abool2(value, title = "") {
      if (typeof value !== "boolean") {
        const prefix = title && `"${title}"`;
        throw new Error(prefix + "expected boolean, got type=" + typeof value);
      }
      return value;
    }
    function _abytes2(value, length2, title = "") {
      const bytes = (0, utils_js_1.isBytes)(value);
      const len = value?.length;
      const needsLen = length2 !== void 0;
      if (!bytes || needsLen && len !== length2) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length2}` : "";
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
      }
      return value;
    }
    function numberToHexUnpadded(num) {
      const hex = num.toString(16);
      return hex.length & 1 ? "0" + hex : hex;
    }
    function hexToNumber(hex) {
      if (typeof hex !== "string")
        throw new Error("hex string expected, got " + typeof hex);
      return hex === "" ? _0n2 : BigInt("0x" + hex);
    }
    function bytesToNumberBE(bytes) {
      return hexToNumber((0, utils_js_1.bytesToHex)(bytes));
    }
    function bytesToNumberLE(bytes) {
      (0, utils_js_1.abytes)(bytes);
      return hexToNumber((0, utils_js_1.bytesToHex)(Uint8Array.from(bytes).reverse()));
    }
    function numberToBytesBE(n, len) {
      return (0, utils_js_1.hexToBytes)(n.toString(16).padStart(len * 2, "0"));
    }
    function numberToBytesLE(n, len) {
      return numberToBytesBE(n, len).reverse();
    }
    function numberToVarBytesBE(n) {
      return (0, utils_js_1.hexToBytes)(numberToHexUnpadded(n));
    }
    function ensureBytes(title, hex, expectedLength) {
      let res;
      if (typeof hex === "string") {
        try {
          res = (0, utils_js_1.hexToBytes)(hex);
        } catch (e) {
          throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
        }
      } else if ((0, utils_js_1.isBytes)(hex)) {
        res = Uint8Array.from(hex);
      } else {
        throw new Error(title + " must be hex string or Uint8Array");
      }
      const len = res.length;
      if (typeof expectedLength === "number" && len !== expectedLength)
        throw new Error(title + " of length " + expectedLength + " expected, got " + len);
      return res;
    }
    function equalBytes2(a, b) {
      if (a.length !== b.length)
        return false;
      let diff = 0;
      for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
      return diff === 0;
    }
    function copyBytes(bytes) {
      return Uint8Array.from(bytes);
    }
    function asciiToBytes(ascii) {
      return Uint8Array.from(ascii, (c, i) => {
        const charCode = c.charCodeAt(0);
        if (c.length !== 1 || charCode > 127) {
          throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
        }
        return charCode;
      });
    }
    var isPosBig = (n) => typeof n === "bigint" && _0n2 <= n;
    function inRange(n, min, max) {
      return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
    }
    function aInRange(title, n, min, max) {
      if (!inRange(n, min, max))
        throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
    }
    function bitLen(n) {
      let len;
      for (len = 0; n > _0n2; n >>= _1n2, len += 1)
        ;
      return len;
    }
    function bitGet(n, pos) {
      return n >> BigInt(pos) & _1n2;
    }
    function bitSet(n, pos, value) {
      return n | (value ? _1n2 : _0n2) << BigInt(pos);
    }
    var bitMask = (n) => (_1n2 << BigInt(n)) - _1n2;
    exports2.bitMask = bitMask;
    function createHmacDrbg(hashLen, qByteLen, hmacFn) {
      if (typeof hashLen !== "number" || hashLen < 2)
        throw new Error("hashLen must be a number");
      if (typeof qByteLen !== "number" || qByteLen < 2)
        throw new Error("qByteLen must be a number");
      if (typeof hmacFn !== "function")
        throw new Error("hmacFn must be a function");
      const u8n = (len) => new Uint8Array(len);
      const u8of = (byte) => Uint8Array.of(byte);
      let v = u8n(hashLen);
      let k = u8n(hashLen);
      let i = 0;
      const reset = () => {
        v.fill(1);
        k.fill(0);
        i = 0;
      };
      const h2 = (...b) => hmacFn(k, v, ...b);
      const reseed = (seed = u8n(0)) => {
        k = h2(u8of(0), seed);
        v = h2();
        if (seed.length === 0)
          return;
        k = h2(u8of(1), seed);
        v = h2();
      };
      const gen = () => {
        if (i++ >= 1e3)
          throw new Error("drbg: tried 1000 values");
        let len = 0;
        const out = [];
        while (len < qByteLen) {
          v = h2();
          const sl = v.slice();
          out.push(sl);
          len += v.length;
        }
        return (0, utils_js_1.concatBytes)(...out);
      };
      const genUntil = (seed, pred) => {
        reset();
        reseed(seed);
        let res = void 0;
        while (!(res = pred(gen())))
          reseed();
        reset();
        return res;
      };
      return genUntil;
    }
    var validatorFns = {
      bigint: (val) => typeof val === "bigint",
      function: (val) => typeof val === "function",
      boolean: (val) => typeof val === "boolean",
      string: (val) => typeof val === "string",
      stringOrUint8Array: (val) => typeof val === "string" || (0, utils_js_1.isBytes)(val),
      isSafeInteger: (val) => Number.isSafeInteger(val),
      array: (val) => Array.isArray(val),
      field: (val, object2) => object2.Fp.isValid(val),
      hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
    };
    function validateObject(object2, validators, optValidators = {}) {
      const checkField = (fieldName, type, isOptional) => {
        const checkVal = validatorFns[type];
        if (typeof checkVal !== "function")
          throw new Error("invalid validator function");
        const val = object2[fieldName];
        if (isOptional && val === void 0)
          return;
        if (!checkVal(val, object2)) {
          throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
        }
      };
      for (const [fieldName, type] of Object.entries(validators))
        checkField(fieldName, type, false);
      for (const [fieldName, type] of Object.entries(optValidators))
        checkField(fieldName, type, true);
      return object2;
    }
    function isHash(val) {
      return typeof val === "function" && Number.isSafeInteger(val.outputLen);
    }
    function _validateObject(object2, fields, optFields = {}) {
      if (!object2 || typeof object2 !== "object")
        throw new Error("expected valid options object");
      function checkField(fieldName, expectedType, isOpt) {
        const val = object2[fieldName];
        if (isOpt && val === void 0)
          return;
        const current = typeof val;
        if (current !== expectedType || val === null)
          throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
      }
      Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
      Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
    }
    var notImplemented = () => {
      throw new Error("not implemented");
    };
    exports2.notImplemented = notImplemented;
    function memoized(fn) {
      const map = /* @__PURE__ */ new WeakMap();
      return (arg, ...args) => {
        const val = map.get(arg);
        if (val !== void 0)
          return val;
        const computed = fn(arg, ...args);
        map.set(arg, computed);
        return computed;
      };
    }
  }
});

// node_modules/@noble/curves/abstract/modular.js
var require_modular = __commonJS({
  "node_modules/@noble/curves/abstract/modular.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isNegativeLE = void 0;
    exports2.mod = mod;
    exports2.pow = pow;
    exports2.pow2 = pow2;
    exports2.invert = invert;
    exports2.tonelliShanks = tonelliShanks;
    exports2.FpSqrt = FpSqrt;
    exports2.validateField = validateField;
    exports2.FpPow = FpPow;
    exports2.FpInvertBatch = FpInvertBatch;
    exports2.FpDiv = FpDiv;
    exports2.FpLegendre = FpLegendre;
    exports2.FpIsSquare = FpIsSquare;
    exports2.nLength = nLength;
    exports2.Field = Field;
    exports2.FpSqrtOdd = FpSqrtOdd;
    exports2.FpSqrtEven = FpSqrtEven;
    exports2.hashToPrivateScalar = hashToPrivateScalar;
    exports2.getFieldBytesLength = getFieldBytesLength;
    exports2.getMinHashLength = getMinHashLength;
    exports2.mapHashToField = mapHashToField;
    var utils_ts_1 = require_utils3();
    var _0n2 = BigInt(0);
    var _1n2 = BigInt(1);
    var _2n2 = /* @__PURE__ */ BigInt(2);
    var _3n = /* @__PURE__ */ BigInt(3);
    var _4n = /* @__PURE__ */ BigInt(4);
    var _5n = /* @__PURE__ */ BigInt(5);
    var _7n2 = /* @__PURE__ */ BigInt(7);
    var _8n = /* @__PURE__ */ BigInt(8);
    var _9n = /* @__PURE__ */ BigInt(9);
    var _16n = /* @__PURE__ */ BigInt(16);
    function mod(a, b) {
      const result = a % b;
      return result >= _0n2 ? result : b + result;
    }
    function pow(num, power, modulo) {
      return FpPow(Field(modulo), num, power);
    }
    function pow2(x, power, modulo) {
      let res = x;
      while (power-- > _0n2) {
        res *= res;
        res %= modulo;
      }
      return res;
    }
    function invert(number2, modulo) {
      if (number2 === _0n2)
        throw new Error("invert: expected non-zero number");
      if (modulo <= _0n2)
        throw new Error("invert: expected positive modulus, got " + modulo);
      let a = mod(number2, modulo);
      let b = modulo;
      let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
      while (a !== _0n2) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        b = a, a = r, x = u, y = v, u = m, v = n;
      }
      const gcd = b;
      if (gcd !== _1n2)
        throw new Error("invert: does not exist");
      return mod(x, modulo);
    }
    function assertIsSquare(Fp, root, n) {
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
    }
    function sqrt3mod4(Fp, n) {
      const p1div4 = (Fp.ORDER + _1n2) / _4n;
      const root = Fp.pow(n, p1div4);
      assertIsSquare(Fp, root, n);
      return root;
    }
    function sqrt5mod8(Fp, n) {
      const p5div8 = (Fp.ORDER - _5n) / _8n;
      const n2 = Fp.mul(n, _2n2);
      const v = Fp.pow(n2, p5div8);
      const nv = Fp.mul(n, v);
      const i = Fp.mul(Fp.mul(nv, _2n2), v);
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
      assertIsSquare(Fp, root, n);
      return root;
    }
    function sqrt9mod16(P) {
      const Fp_ = Field(P);
      const tn = tonelliShanks(P);
      const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
      const c2 = tn(Fp_, c1);
      const c3 = tn(Fp_, Fp_.neg(c1));
      const c4 = (P + _7n2) / _16n;
      return (Fp, n) => {
        let tv1 = Fp.pow(n, c4);
        let tv2 = Fp.mul(tv1, c1);
        const tv3 = Fp.mul(tv1, c2);
        const tv4 = Fp.mul(tv1, c3);
        const e1 = Fp.eql(Fp.sqr(tv2), n);
        const e2 = Fp.eql(Fp.sqr(tv3), n);
        tv1 = Fp.cmov(tv1, tv2, e1);
        tv2 = Fp.cmov(tv4, tv3, e2);
        const e3 = Fp.eql(Fp.sqr(tv2), n);
        const root = Fp.cmov(tv1, tv2, e3);
        assertIsSquare(Fp, root, n);
        return root;
      };
    }
    function tonelliShanks(P) {
      if (P < _3n)
        throw new Error("sqrt is not defined for small field");
      let Q2 = P - _1n2;
      let S = 0;
      while (Q2 % _2n2 === _0n2) {
        Q2 /= _2n2;
        S++;
      }
      let Z = _2n2;
      const _Fp = Field(P);
      while (FpLegendre(_Fp, Z) === 1) {
        if (Z++ > 1e3)
          throw new Error("Cannot find square root: probably non-prime P");
      }
      if (S === 1)
        return sqrt3mod4;
      let cc = _Fp.pow(Z, Q2);
      const Q1div2 = (Q2 + _1n2) / _2n2;
      return function tonelliSlow(Fp, n) {
        if (Fp.is0(n))
          return n;
        if (FpLegendre(Fp, n) !== 1)
          throw new Error("Cannot find square root");
        let M = S;
        let c = Fp.mul(Fp.ONE, cc);
        let t = Fp.pow(n, Q2);
        let R = Fp.pow(n, Q1div2);
        while (!Fp.eql(t, Fp.ONE)) {
          if (Fp.is0(t))
            return Fp.ZERO;
          let i = 1;
          let t_tmp = Fp.sqr(t);
          while (!Fp.eql(t_tmp, Fp.ONE)) {
            i++;
            t_tmp = Fp.sqr(t_tmp);
            if (i === M)
              throw new Error("Cannot find square root");
          }
          const exponent = _1n2 << BigInt(M - i - 1);
          const b = Fp.pow(c, exponent);
          M = i;
          c = Fp.sqr(b);
          t = Fp.mul(t, c);
          R = Fp.mul(R, b);
        }
        return R;
      };
    }
    function FpSqrt(P) {
      if (P % _4n === _3n)
        return sqrt3mod4;
      if (P % _8n === _5n)
        return sqrt5mod8;
      if (P % _16n === _9n)
        return sqrt9mod16(P);
      return tonelliShanks(P);
    }
    var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
    exports2.isNegativeLE = isNegativeLE;
    var FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    function validateField(field) {
      const initial = {
        ORDER: "bigint",
        MASK: "bigint",
        BYTES: "number",
        BITS: "number"
      };
      const opts = FIELD_FIELDS.reduce((map, val) => {
        map[val] = "function";
        return map;
      }, initial);
      (0, utils_ts_1._validateObject)(field, opts);
      return field;
    }
    function FpPow(Fp, num, power) {
      if (power < _0n2)
        throw new Error("invalid exponent, negatives unsupported");
      if (power === _0n2)
        return Fp.ONE;
      if (power === _1n2)
        return num;
      let p = Fp.ONE;
      let d = num;
      while (power > _0n2) {
        if (power & _1n2)
          p = Fp.mul(p, d);
        d = Fp.sqr(d);
        power >>= _1n2;
      }
      return p;
    }
    function FpInvertBatch(Fp, nums, passZero = false) {
      const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
      const multipliedAcc = nums.reduce((acc, num, i) => {
        if (Fp.is0(num))
          return acc;
        inverted[i] = acc;
        return Fp.mul(acc, num);
      }, Fp.ONE);
      const invertedAcc = Fp.inv(multipliedAcc);
      nums.reduceRight((acc, num, i) => {
        if (Fp.is0(num))
          return acc;
        inverted[i] = Fp.mul(acc, inverted[i]);
        return Fp.mul(acc, num);
      }, invertedAcc);
      return inverted;
    }
    function FpDiv(Fp, lhs, rhs) {
      return Fp.mul(lhs, typeof rhs === "bigint" ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
    }
    function FpLegendre(Fp, n) {
      const p1mod2 = (Fp.ORDER - _1n2) / _2n2;
      const powered = Fp.pow(n, p1mod2);
      const yes = Fp.eql(powered, Fp.ONE);
      const zero = Fp.eql(powered, Fp.ZERO);
      const no = Fp.eql(powered, Fp.neg(Fp.ONE));
      if (!yes && !zero && !no)
        throw new Error("invalid Legendre symbol result");
      return yes ? 1 : zero ? 0 : -1;
    }
    function FpIsSquare(Fp, n) {
      const l = FpLegendre(Fp, n);
      return l === 1;
    }
    function nLength(n, nBitLength) {
      if (nBitLength !== void 0)
        (0, utils_ts_1.anumber)(nBitLength);
      const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
      const nByteLength = Math.ceil(_nBitLength / 8);
      return { nBitLength: _nBitLength, nByteLength };
    }
    function Field(ORDER, bitLenOrOpts, isLE2 = false, opts = {}) {
      if (ORDER <= _0n2)
        throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
      let _nbitLength = void 0;
      let _sqrt = void 0;
      let modFromBytes = false;
      let allowedLengths = void 0;
      if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
        if (opts.sqrt || isLE2)
          throw new Error("cannot specify opts in two arguments");
        const _opts = bitLenOrOpts;
        if (_opts.BITS)
          _nbitLength = _opts.BITS;
        if (_opts.sqrt)
          _sqrt = _opts.sqrt;
        if (typeof _opts.isLE === "boolean")
          isLE2 = _opts.isLE;
        if (typeof _opts.modFromBytes === "boolean")
          modFromBytes = _opts.modFromBytes;
        allowedLengths = _opts.allowedLengths;
      } else {
        if (typeof bitLenOrOpts === "number")
          _nbitLength = bitLenOrOpts;
        if (opts.sqrt)
          _sqrt = opts.sqrt;
      }
      const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
      if (BYTES > 2048)
        throw new Error("invalid field: expected ORDER of <= 2048 bytes");
      let sqrtP;
      const f = Object.freeze({
        ORDER,
        isLE: isLE2,
        BITS,
        BYTES,
        MASK: (0, utils_ts_1.bitMask)(BITS),
        ZERO: _0n2,
        ONE: _1n2,
        allowedLengths,
        create: (num) => mod(num, ORDER),
        isValid: (num) => {
          if (typeof num !== "bigint")
            throw new Error("invalid field element: expected bigint, got " + typeof num);
          return _0n2 <= num && num < ORDER;
        },
        is0: (num) => num === _0n2,
        // is valid and invertible
        isValidNot0: (num) => !f.is0(num) && f.isValid(num),
        isOdd: (num) => (num & _1n2) === _1n2,
        neg: (num) => mod(-num, ORDER),
        eql: (lhs, rhs) => lhs === rhs,
        sqr: (num) => mod(num * num, ORDER),
        add: (lhs, rhs) => mod(lhs + rhs, ORDER),
        sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
        mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
        pow: (num, power) => FpPow(f, num, power),
        div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
        // Same as above, but doesn't normalize
        sqrN: (num) => num * num,
        addN: (lhs, rhs) => lhs + rhs,
        subN: (lhs, rhs) => lhs - rhs,
        mulN: (lhs, rhs) => lhs * rhs,
        inv: (num) => invert(num, ORDER),
        sqrt: _sqrt || ((n) => {
          if (!sqrtP)
            sqrtP = FpSqrt(ORDER);
          return sqrtP(f, n);
        }),
        toBytes: (num) => isLE2 ? (0, utils_ts_1.numberToBytesLE)(num, BYTES) : (0, utils_ts_1.numberToBytesBE)(num, BYTES),
        fromBytes: (bytes, skipValidation = true) => {
          if (allowedLengths) {
            if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
              throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
            }
            const padded = new Uint8Array(BYTES);
            padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
            bytes = padded;
          }
          if (bytes.length !== BYTES)
            throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
          let scalar = isLE2 ? (0, utils_ts_1.bytesToNumberLE)(bytes) : (0, utils_ts_1.bytesToNumberBE)(bytes);
          if (modFromBytes)
            scalar = mod(scalar, ORDER);
          if (!skipValidation) {
            if (!f.isValid(scalar))
              throw new Error("invalid field element: outside of range 0..ORDER");
          }
          return scalar;
        },
        // TODO: we don't need it here, move out to separate fn
        invertBatch: (lst) => FpInvertBatch(f, lst),
        // We can't move this out because Fp6, Fp12 implement it
        // and it's unclear what to return in there.
        cmov: (a, b, c) => c ? b : a
      });
      return Object.freeze(f);
    }
    function FpSqrtOdd(Fp, elm) {
      if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
      const root = Fp.sqrt(elm);
      return Fp.isOdd(root) ? root : Fp.neg(root);
    }
    function FpSqrtEven(Fp, elm) {
      if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
      const root = Fp.sqrt(elm);
      return Fp.isOdd(root) ? Fp.neg(root) : root;
    }
    function hashToPrivateScalar(hash, groupOrder, isLE2 = false) {
      hash = (0, utils_ts_1.ensureBytes)("privateHash", hash);
      const hashLen = hash.length;
      const minLen = nLength(groupOrder).nByteLength + 8;
      if (minLen < 24 || hashLen < minLen || hashLen > 1024)
        throw new Error("hashToPrivateScalar: expected " + minLen + "-1024 bytes of input, got " + hashLen);
      const num = isLE2 ? (0, utils_ts_1.bytesToNumberLE)(hash) : (0, utils_ts_1.bytesToNumberBE)(hash);
      return mod(num, groupOrder - _1n2) + _1n2;
    }
    function getFieldBytesLength(fieldOrder) {
      if (typeof fieldOrder !== "bigint")
        throw new Error("field order must be bigint");
      const bitLength = fieldOrder.toString(2).length;
      return Math.ceil(bitLength / 8);
    }
    function getMinHashLength(fieldOrder) {
      const length2 = getFieldBytesLength(fieldOrder);
      return length2 + Math.ceil(length2 / 2);
    }
    function mapHashToField(key, fieldOrder, isLE2 = false) {
      const len = key.length;
      const fieldLen = getFieldBytesLength(fieldOrder);
      const minLen = getMinHashLength(fieldOrder);
      if (len < 16 || len < minLen || len > 1024)
        throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
      const num = isLE2 ? (0, utils_ts_1.bytesToNumberLE)(key) : (0, utils_ts_1.bytesToNumberBE)(key);
      const reduced = mod(num, fieldOrder - _1n2) + _1n2;
      return isLE2 ? (0, utils_ts_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_ts_1.numberToBytesBE)(reduced, fieldLen);
    }
  }
});

// node_modules/@noble/curves/abstract/curve.js
var require_curve = __commonJS({
  "node_modules/@noble/curves/abstract/curve.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.wNAF = void 0;
    exports2.negateCt = negateCt;
    exports2.normalizeZ = normalizeZ;
    exports2.mulEndoUnsafe = mulEndoUnsafe;
    exports2.pippenger = pippenger;
    exports2.precomputeMSMUnsafe = precomputeMSMUnsafe;
    exports2.validateBasic = validateBasic;
    exports2._createCurveFields = _createCurveFields;
    var utils_ts_1 = require_utils3();
    var modular_ts_1 = require_modular();
    var _0n2 = BigInt(0);
    var _1n2 = BigInt(1);
    function negateCt(condition, item) {
      const neg = item.negate();
      return condition ? neg : item;
    }
    function normalizeZ(c, points) {
      const invertedZs = (0, modular_ts_1.FpInvertBatch)(c.Fp, points.map((p) => p.Z));
      return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
    }
    function validateW(W, bits) {
      if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
        throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
    }
    function calcWOpts(W, scalarBits) {
      validateW(W, scalarBits);
      const windows = Math.ceil(scalarBits / W) + 1;
      const windowSize = 2 ** (W - 1);
      const maxNumber = 2 ** W;
      const mask = (0, utils_ts_1.bitMask)(W);
      const shiftBy = BigInt(W);
      return { windows, windowSize, mask, maxNumber, shiftBy };
    }
    function calcOffsets(n, window, wOpts) {
      const { windowSize, mask, maxNumber, shiftBy } = wOpts;
      let wbits = Number(n & mask);
      let nextN = n >> shiftBy;
      if (wbits > windowSize) {
        wbits -= maxNumber;
        nextN += _1n2;
      }
      const offsetStart = window * windowSize;
      const offset = offsetStart + Math.abs(wbits) - 1;
      const isZero = wbits === 0;
      const isNeg = wbits < 0;
      const isNegF = window % 2 !== 0;
      const offsetF = offsetStart;
      return { nextN, offset, isZero, isNeg, isNegF, offsetF };
    }
    function validateMSMPoints(points, c) {
      if (!Array.isArray(points))
        throw new Error("array expected");
      points.forEach((p, i) => {
        if (!(p instanceof c))
          throw new Error("invalid point at index " + i);
      });
    }
    function validateMSMScalars(scalars, field) {
      if (!Array.isArray(scalars))
        throw new Error("array of scalars expected");
      scalars.forEach((s, i) => {
        if (!field.isValid(s))
          throw new Error("invalid scalar at index " + i);
      });
    }
    var pointPrecomputes = /* @__PURE__ */ new WeakMap();
    var pointWindowSizes = /* @__PURE__ */ new WeakMap();
    function getW(P) {
      return pointWindowSizes.get(P) || 1;
    }
    function assert0(n) {
      if (n !== _0n2)
        throw new Error("invalid wNAF");
    }
    var wNAF = class {
      // Parametrized with a given Point class (not individual point)
      constructor(Point, bits) {
        this.BASE = Point.BASE;
        this.ZERO = Point.ZERO;
        this.Fn = Point.Fn;
        this.bits = bits;
      }
      // non-const time multiplication ladder
      _unsafeLadder(elm, n, p = this.ZERO) {
        let d = elm;
        while (n > _0n2) {
          if (n & _1n2)
            p = p.add(d);
          d = d.double();
          n >>= _1n2;
        }
        return p;
      }
      /**
       * Creates a wNAF precomputation window. Used for caching.
       * Default window size is set by `utils.precompute()` and is equal to 8.
       * Number of precomputed points depends on the curve size:
       * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
       * - 𝑊 is the window size
       * - 𝑛 is the bitlength of the curve order.
       * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
       * @param point Point instance
       * @param W window size
       * @returns precomputed point tables flattened to a single array
       */
      precomputeWindow(point, W) {
        const { windows, windowSize } = calcWOpts(W, this.bits);
        const points = [];
        let p = point;
        let base2 = p;
        for (let window = 0; window < windows; window++) {
          base2 = p;
          points.push(base2);
          for (let i = 1; i < windowSize; i++) {
            base2 = base2.add(p);
            points.push(base2);
          }
          p = base2.double();
        }
        return points;
      }
      /**
       * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
       * More compact implementation:
       * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
       * @returns real and fake (for const-time) points
       */
      wNAF(W, precomputes, n) {
        if (!this.Fn.isValid(n))
          throw new Error("invalid scalar");
        let p = this.ZERO;
        let f = this.BASE;
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
          const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
          n = nextN;
          if (isZero) {
            f = f.add(negateCt(isNegF, precomputes[offsetF]));
          } else {
            p = p.add(negateCt(isNeg, precomputes[offset]));
          }
        }
        assert0(n);
        return { p, f };
      }
      /**
       * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
       * @param acc accumulator point to add result of multiplication
       * @returns point
       */
      wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
          if (n === _0n2)
            break;
          const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
          n = nextN;
          if (isZero) {
            continue;
          } else {
            const item = precomputes[offset];
            acc = acc.add(isNeg ? item.negate() : item);
          }
        }
        assert0(n);
        return acc;
      }
      getPrecomputes(W, point, transform2) {
        let comp = pointPrecomputes.get(point);
        if (!comp) {
          comp = this.precomputeWindow(point, W);
          if (W !== 1) {
            if (typeof transform2 === "function")
              comp = transform2(comp);
            pointPrecomputes.set(point, comp);
          }
        }
        return comp;
      }
      cached(point, scalar, transform2) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform2), scalar);
      }
      unsafe(point, scalar, transform2, prev) {
        const W = getW(point);
        if (W === 1)
          return this._unsafeLadder(point, scalar, prev);
        return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform2), scalar, prev);
      }
      // We calculate precomputes for elliptic curve point multiplication
      // using windowed method. This specifies window size and
      // stores precomputed values. Usually only base point would be precomputed.
      createCache(P, W) {
        validateW(W, this.bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
      }
      hasCache(elm) {
        return getW(elm) !== 1;
      }
    };
    exports2.wNAF = wNAF;
    function mulEndoUnsafe(Point, point, k1, k2) {
      let acc = point;
      let p1 = Point.ZERO;
      let p2 = Point.ZERO;
      while (k1 > _0n2 || k2 > _0n2) {
        if (k1 & _1n2)
          p1 = p1.add(acc);
        if (k2 & _1n2)
          p2 = p2.add(acc);
        acc = acc.double();
        k1 >>= _1n2;
        k2 >>= _1n2;
      }
      return { p1, p2 };
    }
    function pippenger(c, fieldN, points, scalars) {
      validateMSMPoints(points, c);
      validateMSMScalars(scalars, fieldN);
      const plength = points.length;
      const slength = scalars.length;
      if (plength !== slength)
        throw new Error("arrays of points and scalars must have equal length");
      const zero = c.ZERO;
      const wbits = (0, utils_ts_1.bitLen)(BigInt(plength));
      let windowSize = 1;
      if (wbits > 12)
        windowSize = wbits - 3;
      else if (wbits > 4)
        windowSize = wbits - 2;
      else if (wbits > 0)
        windowSize = 2;
      const MASK = (0, utils_ts_1.bitMask)(windowSize);
      const buckets = new Array(Number(MASK) + 1).fill(zero);
      const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
      let sum = zero;
      for (let i = lastBits; i >= 0; i -= windowSize) {
        buckets.fill(zero);
        for (let j = 0; j < slength; j++) {
          const scalar = scalars[j];
          const wbits2 = Number(scalar >> BigInt(i) & MASK);
          buckets[wbits2] = buckets[wbits2].add(points[j]);
        }
        let resI = zero;
        for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
          sumI = sumI.add(buckets[j]);
          resI = resI.add(sumI);
        }
        sum = sum.add(resI);
        if (i !== 0)
          for (let j = 0; j < windowSize; j++)
            sum = sum.double();
      }
      return sum;
    }
    function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
      validateW(windowSize, fieldN.BITS);
      validateMSMPoints(points, c);
      const zero = c.ZERO;
      const tableSize = 2 ** windowSize - 1;
      const chunks = Math.ceil(fieldN.BITS / windowSize);
      const MASK = (0, utils_ts_1.bitMask)(windowSize);
      const tables = points.map((p) => {
        const res = [];
        for (let i = 0, acc = p; i < tableSize; i++) {
          res.push(acc);
          acc = acc.add(p);
        }
        return res;
      });
      return (scalars) => {
        validateMSMScalars(scalars, fieldN);
        if (scalars.length > points.length)
          throw new Error("array of scalars must be smaller than array of points");
        let res = zero;
        for (let i = 0; i < chunks; i++) {
          if (res !== zero)
            for (let j = 0; j < windowSize; j++)
              res = res.double();
          const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
          for (let j = 0; j < scalars.length; j++) {
            const n = scalars[j];
            const curr = Number(n >> shiftBy & MASK);
            if (!curr)
              continue;
            res = res.add(tables[j][curr - 1]);
          }
        }
        return res;
      };
    }
    function validateBasic(curve) {
      (0, modular_ts_1.validateField)(curve.Fp);
      (0, utils_ts_1.validateObject)(curve, {
        n: "bigint",
        h: "bigint",
        Gx: "field",
        Gy: "field"
      }, {
        nBitLength: "isSafeInteger",
        nByteLength: "isSafeInteger"
      });
      return Object.freeze({
        ...(0, modular_ts_1.nLength)(curve.n, curve.nBitLength),
        ...curve,
        ...{ p: curve.Fp.ORDER }
      });
    }
    function createField(order, field, isLE2) {
      if (field) {
        if (field.ORDER !== order)
          throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
        (0, modular_ts_1.validateField)(field);
        return field;
      } else {
        return (0, modular_ts_1.Field)(order, { isLE: isLE2 });
      }
    }
    function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
      if (FpFnLE === void 0)
        FpFnLE = type === "edwards";
      if (!CURVE || typeof CURVE !== "object")
        throw new Error(`expected valid ${type} CURVE object`);
      for (const p of ["p", "n", "h"]) {
        const val = CURVE[p];
        if (!(typeof val === "bigint" && val > _0n2))
          throw new Error(`CURVE.${p} must be positive bigint`);
      }
      const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
      const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
      const _b = type === "weierstrass" ? "b" : "d";
      const params = ["Gx", "Gy", "a", _b];
      for (const p of params) {
        if (!Fp.isValid(CURVE[p]))
          throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
      }
      CURVE = Object.freeze(Object.assign({}, CURVE));
      return { CURVE, Fp, Fn };
    }
  }
});

// node_modules/@noble/curves/abstract/weierstrass.js
var require_weierstrass = __commonJS({
  "node_modules/@noble/curves/abstract/weierstrass.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DER = exports2.DERErr = void 0;
    exports2._splitEndoScalar = _splitEndoScalar;
    exports2._normFnElement = _normFnElement;
    exports2.weierstrassN = weierstrassN;
    exports2.SWUFpSqrtRatio = SWUFpSqrtRatio;
    exports2.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
    exports2.ecdh = ecdh;
    exports2.ecdsa = ecdsa;
    exports2.weierstrassPoints = weierstrassPoints;
    exports2._legacyHelperEquat = _legacyHelperEquat;
    exports2.weierstrass = weierstrass;
    var hmac_js_1 = require_hmac();
    var utils_1 = require_utils();
    var utils_ts_1 = require_utils3();
    var curve_ts_1 = require_curve();
    var modular_ts_1 = require_modular();
    var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
    function _splitEndoScalar(k, basis, n) {
      const [[a1, b1], [a2, b2]] = basis;
      const c1 = divNearest(b2 * k, n);
      const c2 = divNearest(-b1 * k, n);
      let k1 = k - c1 * a1 - c2 * a2;
      let k2 = -c1 * b1 - c2 * b2;
      const k1neg = k1 < _0n2;
      const k2neg = k2 < _0n2;
      if (k1neg)
        k1 = -k1;
      if (k2neg)
        k2 = -k2;
      const MAX_NUM = (0, utils_ts_1.bitMask)(Math.ceil((0, utils_ts_1.bitLen)(n) / 2)) + _1n2;
      if (k1 < _0n2 || k1 >= MAX_NUM || k2 < _0n2 || k2 >= MAX_NUM) {
        throw new Error("splitScalar (endomorphism): failed, k=" + k);
      }
      return { k1neg, k1, k2neg, k2 };
    }
    function validateSigFormat(format) {
      if (!["compact", "recovered", "der"].includes(format))
        throw new Error('Signature format must be "compact", "recovered", or "der"');
      return format;
    }
    function validateSigOpts2(opts, def) {
      const optsn = {};
      for (let optName of Object.keys(def)) {
        optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
      }
      (0, utils_ts_1._abool2)(optsn.lowS, "lowS");
      (0, utils_ts_1._abool2)(optsn.prehash, "prehash");
      if (optsn.format !== void 0)
        validateSigFormat(optsn.format);
      return optsn;
    }
    var DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    exports2.DERErr = DERErr;
    exports2.DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = exports2.DER;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = (0, utils_ts_1.numberToHexUnpadded)(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? (0, utils_ts_1.numberToHexUnpadded)(len.length / 2 | 128) : "";
          const t = (0, utils_ts_1.numberToHexUnpadded)(tag);
          return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = exports2.DER;
          let pos = 0;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length2 = 0;
          if (!isLong)
            length2 = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length2 = length2 << 8 | b;
            pos += lenLen;
            if (length2 < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length2);
          if (v.length !== length2)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length2) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num) {
          const { Err: E } = exports2.DER;
          if (num < _0n2)
            throw new E("integer: negative integers are not allowed");
          let hex = (0, utils_ts_1.numberToHexUnpadded)(num);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = exports2.DER;
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return (0, utils_ts_1.bytesToNumberBE)(data);
        }
      },
      toSig(hex) {
        const { Err: E, _int: int, _tlv: tlv } = exports2.DER;
        const data = (0, utils_ts_1.ensureBytes)("signature", hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = exports2.DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    var _0n2 = BigInt(0);
    var _1n2 = BigInt(1);
    var _2n2 = BigInt(2);
    var _3n = BigInt(3);
    var _4n = BigInt(4);
    function _normFnElement(Fn, key) {
      const { BYTES: expected } = Fn;
      let num;
      if (typeof key === "bigint") {
        num = key;
      } else {
        let bytes = (0, utils_ts_1.ensureBytes)("private key", key);
        try {
          num = Fn.fromBytes(bytes);
        } catch (error) {
          throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
        }
      }
      if (!Fn.isValidNot0(num))
        throw new Error("invalid private key: out of range [1..N-1]");
      return num;
    }
    function weierstrassN(params, extraOpts = {}) {
      const validated = (0, curve_ts_1._createCurveFields)("weierstrass", params, extraOpts);
      const { Fp, Fn } = validated;
      let CURVE = validated.CURVE;
      const { h: cofactor, n: CURVE_ORDER } = CURVE;
      (0, utils_ts_1._validateObject)(extraOpts, {}, {
        allowInfinityPoint: "boolean",
        clearCofactor: "function",
        isTorsionFree: "function",
        fromBytes: "function",
        toBytes: "function",
        endo: "object",
        wrapPrivateKey: "boolean"
      });
      const { endo } = extraOpts;
      if (endo) {
        if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
          throw new Error('invalid endo: expected "beta": bigint and "basises": array');
        }
      }
      const lengths = getWLengths(Fp, Fn);
      function assertCompressionIsSupported() {
        if (!Fp.isOdd)
          throw new Error("compression is not supported: Field does not have .isOdd()");
      }
      function pointToBytes(_c, point, isCompressed) {
        const { x, y } = point.toAffine();
        const bx = Fp.toBytes(x);
        (0, utils_ts_1._abool2)(isCompressed, "isCompressed");
        if (isCompressed) {
          assertCompressionIsSupported();
          const hasEvenY = !Fp.isOdd(y);
          return (0, utils_ts_1.concatBytes)(pprefix(hasEvenY), bx);
        } else {
          return (0, utils_ts_1.concatBytes)(Uint8Array.of(4), bx, Fp.toBytes(y));
        }
      }
      function pointFromBytes(bytes) {
        (0, utils_ts_1._abytes2)(bytes, void 0, "Point");
        const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
        const length2 = bytes.length;
        const head = bytes[0];
        const tail = bytes.subarray(1);
        if (length2 === comp && (head === 2 || head === 3)) {
          const x = Fp.fromBytes(tail);
          if (!Fp.isValid(x))
            throw new Error("bad point: is not on curve, wrong x");
          const y2 = weierstrassEquation(x);
          let y;
          try {
            y = Fp.sqrt(y2);
          } catch (sqrtError) {
            const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
            throw new Error("bad point: is not on curve, sqrt error" + err);
          }
          assertCompressionIsSupported();
          const isYOdd = Fp.isOdd(y);
          const isHeadOdd = (head & 1) === 1;
          if (isHeadOdd !== isYOdd)
            y = Fp.neg(y);
          return { x, y };
        } else if (length2 === uncomp && head === 4) {
          const L = Fp.BYTES;
          const x = Fp.fromBytes(tail.subarray(0, L));
          const y = Fp.fromBytes(tail.subarray(L, L * 2));
          if (!isValidXY(x, y))
            throw new Error("bad point: is not on curve");
          return { x, y };
        } else {
          throw new Error(`bad point: got length ${length2}, expected compressed=${comp} or uncompressed=${uncomp}`);
        }
      }
      const encodePoint = extraOpts.toBytes || pointToBytes;
      const decodePoint = extraOpts.fromBytes || pointFromBytes;
      function weierstrassEquation(x) {
        const x2 = Fp.sqr(x);
        const x3 = Fp.mul(x2, x);
        return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
      }
      function isValidXY(x, y) {
        const left = Fp.sqr(y);
        const right = weierstrassEquation(x);
        return Fp.eql(left, right);
      }
      if (!isValidXY(CURVE.Gx, CURVE.Gy))
        throw new Error("bad curve params: generator point");
      const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
      const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
      if (Fp.is0(Fp.add(_4a3, _27b2)))
        throw new Error("bad curve params: a or b");
      function acoord(title, n, banZero = false) {
        if (!Fp.isValid(n) || banZero && Fp.is0(n))
          throw new Error(`bad point coordinate ${title}`);
        return n;
      }
      function aprjpoint(other) {
        if (!(other instanceof Point))
          throw new Error("ProjectivePoint expected");
      }
      function splitEndoScalarN(k) {
        if (!endo || !endo.basises)
          throw new Error("no endo");
        return _splitEndoScalar(k, endo.basises, Fn.ORDER);
      }
      const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
        const { X, Y, Z } = p;
        if (Fp.eql(Z, Fp.ONE))
          return { x: X, y: Y };
        const is0 = p.is0();
        if (iz == null)
          iz = is0 ? Fp.ONE : Fp.inv(Z);
        const x = Fp.mul(X, iz);
        const y = Fp.mul(Y, iz);
        const zz = Fp.mul(Z, iz);
        if (is0)
          return { x: Fp.ZERO, y: Fp.ZERO };
        if (!Fp.eql(zz, Fp.ONE))
          throw new Error("invZ was invalid");
        return { x, y };
      });
      const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
        if (p.is0()) {
          if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
            return;
          throw new Error("bad point: ZERO");
        }
        const { x, y } = p.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("bad point: x or y not field elements");
        if (!isValidXY(x, y))
          throw new Error("bad point: equation left != right");
        if (!p.isTorsionFree())
          throw new Error("bad point: not in prime-order subgroup");
        return true;
      });
      function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
        k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
        k1p = (0, curve_ts_1.negateCt)(k1neg, k1p);
        k2p = (0, curve_ts_1.negateCt)(k2neg, k2p);
        return k1p.add(k2p);
      }
      class Point {
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
        constructor(X, Y, Z) {
          this.X = acoord("x", X);
          this.Y = acoord("y", Y, true);
          this.Z = acoord("z", Z);
          Object.freeze(this);
        }
        static CURVE() {
          return CURVE;
        }
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
        static fromAffine(p) {
          const { x, y } = p || {};
          if (!p || !Fp.isValid(x) || !Fp.isValid(y))
            throw new Error("invalid affine point");
          if (p instanceof Point)
            throw new Error("projective point not allowed");
          if (Fp.is0(x) && Fp.is0(y))
            return Point.ZERO;
          return new Point(x, y, Fp.ONE);
        }
        static fromBytes(bytes) {
          const P = Point.fromAffine(decodePoint((0, utils_ts_1._abytes2)(bytes, void 0, "point")));
          P.assertValidity();
          return P;
        }
        static fromHex(hex) {
          return Point.fromBytes((0, utils_ts_1.ensureBytes)("pointHex", hex));
        }
        get x() {
          return this.toAffine().x;
        }
        get y() {
          return this.toAffine().y;
        }
        /**
         *
         * @param windowSize
         * @param isLazy true will defer table computation until the first multiplication
         * @returns
         */
        precompute(windowSize = 8, isLazy = true) {
          wnaf.createCache(this, windowSize);
          if (!isLazy)
            this.multiply(_3n);
          return this;
        }
        // TODO: return `this`
        /** A point on curve is valid if it conforms to equation. */
        assertValidity() {
          assertValidMemo(this);
        }
        hasEvenY() {
          const { y } = this.toAffine();
          if (!Fp.isOdd)
            throw new Error("Field doesn't support isOdd");
          return !Fp.isOdd(y);
        }
        /** Compare one point to another. */
        equals(other) {
          aprjpoint(other);
          const { X: X1, Y: Y1, Z: Z1 } = this;
          const { X: X2, Y: Y2, Z: Z2 } = other;
          const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
          const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
          return U1 && U2;
        }
        /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
        negate() {
          return new Point(this.X, Fp.neg(this.Y), this.Z);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
          const { a, b } = CURVE;
          const b3 = Fp.mul(b, _3n);
          const { X: X1, Y: Y1, Z: Z1 } = this;
          let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
          let t0 = Fp.mul(X1, X1);
          let t1 = Fp.mul(Y1, Y1);
          let t2 = Fp.mul(Z1, Z1);
          let t3 = Fp.mul(X1, Y1);
          t3 = Fp.add(t3, t3);
          Z3 = Fp.mul(X1, Z1);
          Z3 = Fp.add(Z3, Z3);
          X3 = Fp.mul(a, Z3);
          Y3 = Fp.mul(b3, t2);
          Y3 = Fp.add(X3, Y3);
          X3 = Fp.sub(t1, Y3);
          Y3 = Fp.add(t1, Y3);
          Y3 = Fp.mul(X3, Y3);
          X3 = Fp.mul(t3, X3);
          Z3 = Fp.mul(b3, Z3);
          t2 = Fp.mul(a, t2);
          t3 = Fp.sub(t0, t2);
          t3 = Fp.mul(a, t3);
          t3 = Fp.add(t3, Z3);
          Z3 = Fp.add(t0, t0);
          t0 = Fp.add(Z3, t0);
          t0 = Fp.add(t0, t2);
          t0 = Fp.mul(t0, t3);
          Y3 = Fp.add(Y3, t0);
          t2 = Fp.mul(Y1, Z1);
          t2 = Fp.add(t2, t2);
          t0 = Fp.mul(t2, t3);
          X3 = Fp.sub(X3, t0);
          Z3 = Fp.mul(t2, t1);
          Z3 = Fp.add(Z3, Z3);
          Z3 = Fp.add(Z3, Z3);
          return new Point(X3, Y3, Z3);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(other) {
          aprjpoint(other);
          const { X: X1, Y: Y1, Z: Z1 } = this;
          const { X: X2, Y: Y2, Z: Z2 } = other;
          let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
          const a = CURVE.a;
          const b3 = Fp.mul(CURVE.b, _3n);
          let t0 = Fp.mul(X1, X2);
          let t1 = Fp.mul(Y1, Y2);
          let t2 = Fp.mul(Z1, Z2);
          let t3 = Fp.add(X1, Y1);
          let t4 = Fp.add(X2, Y2);
          t3 = Fp.mul(t3, t4);
          t4 = Fp.add(t0, t1);
          t3 = Fp.sub(t3, t4);
          t4 = Fp.add(X1, Z1);
          let t5 = Fp.add(X2, Z2);
          t4 = Fp.mul(t4, t5);
          t5 = Fp.add(t0, t2);
          t4 = Fp.sub(t4, t5);
          t5 = Fp.add(Y1, Z1);
          X3 = Fp.add(Y2, Z2);
          t5 = Fp.mul(t5, X3);
          X3 = Fp.add(t1, t2);
          t5 = Fp.sub(t5, X3);
          Z3 = Fp.mul(a, t4);
          X3 = Fp.mul(b3, t2);
          Z3 = Fp.add(X3, Z3);
          X3 = Fp.sub(t1, Z3);
          Z3 = Fp.add(t1, Z3);
          Y3 = Fp.mul(X3, Z3);
          t1 = Fp.add(t0, t0);
          t1 = Fp.add(t1, t0);
          t2 = Fp.mul(a, t2);
          t4 = Fp.mul(b3, t4);
          t1 = Fp.add(t1, t2);
          t2 = Fp.sub(t0, t2);
          t2 = Fp.mul(a, t2);
          t4 = Fp.add(t4, t2);
          t0 = Fp.mul(t1, t4);
          Y3 = Fp.add(Y3, t0);
          t0 = Fp.mul(t5, t4);
          X3 = Fp.mul(t3, X3);
          X3 = Fp.sub(X3, t0);
          t0 = Fp.mul(t3, t1);
          Z3 = Fp.mul(t5, Z3);
          Z3 = Fp.add(Z3, t0);
          return new Point(X3, Y3, Z3);
        }
        subtract(other) {
          return this.add(other.negate());
        }
        is0() {
          return this.equals(Point.ZERO);
        }
        /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */
        multiply(scalar) {
          const { endo: endo2 } = extraOpts;
          if (!Fn.isValidNot0(scalar))
            throw new Error("invalid scalar: out of range");
          let point, fake;
          const mul = (n) => wnaf.cached(this, n, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
          if (endo2) {
            const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
            const { p: k1p, f: k1f } = mul(k1);
            const { p: k2p, f: k2f } = mul(k2);
            fake = k1f.add(k2f);
            point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
          } else {
            const { p, f } = mul(scalar);
            point = p;
            fake = f;
          }
          return (0, curve_ts_1.normalizeZ)(Point, [point, fake])[0];
        }
        /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed secret key e.g. sig verification, which works over *public* keys.
         */
        multiplyUnsafe(sc) {
          const { endo: endo2 } = extraOpts;
          const p = this;
          if (!Fn.isValid(sc))
            throw new Error("invalid scalar: out of range");
          if (sc === _0n2 || p.is0())
            return Point.ZERO;
          if (sc === _1n2)
            return p;
          if (wnaf.hasCache(this))
            return this.multiply(sc);
          if (endo2) {
            const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
            const { p1, p2 } = (0, curve_ts_1.mulEndoUnsafe)(Point, p, k1, k2);
            return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
          } else {
            return wnaf.unsafe(p, sc);
          }
        }
        multiplyAndAddUnsafe(Q2, a, b) {
          const sum = this.multiplyUnsafe(a).add(Q2.multiplyUnsafe(b));
          return sum.is0() ? void 0 : sum;
        }
        /**
         * Converts Projective point to affine (x, y) coordinates.
         * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
         */
        toAffine(invertedZ) {
          return toAffineMemo(this, invertedZ);
        }
        /**
         * Checks whether Point is free of torsion elements (is in prime subgroup).
         * Always torsion-free for cofactor=1 curves.
         */
        isTorsionFree() {
          const { isTorsionFree } = extraOpts;
          if (cofactor === _1n2)
            return true;
          if (isTorsionFree)
            return isTorsionFree(Point, this);
          return wnaf.unsafe(this, CURVE_ORDER).is0();
        }
        clearCofactor() {
          const { clearCofactor } = extraOpts;
          if (cofactor === _1n2)
            return this;
          if (clearCofactor)
            return clearCofactor(Point, this);
          return this.multiplyUnsafe(cofactor);
        }
        isSmallOrder() {
          return this.multiplyUnsafe(cofactor).is0();
        }
        toBytes(isCompressed = true) {
          (0, utils_ts_1._abool2)(isCompressed, "isCompressed");
          this.assertValidity();
          return encodePoint(Point, this, isCompressed);
        }
        toHex(isCompressed = true) {
          return (0, utils_ts_1.bytesToHex)(this.toBytes(isCompressed));
        }
        toString() {
          return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
        }
        // TODO: remove
        get px() {
          return this.X;
        }
        get py() {
          return this.X;
        }
        get pz() {
          return this.Z;
        }
        toRawBytes(isCompressed = true) {
          return this.toBytes(isCompressed);
        }
        _setWindowSize(windowSize) {
          this.precompute(windowSize);
        }
        static normalizeZ(points) {
          return (0, curve_ts_1.normalizeZ)(Point, points);
        }
        static msm(points, scalars) {
          return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
        }
        static fromPrivateKey(privateKey) {
          return Point.BASE.multiply(_normFnElement(Fn, privateKey));
        }
      }
      Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
      Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
      Point.Fp = Fp;
      Point.Fn = Fn;
      const bits = Fn.BITS;
      const wnaf = new curve_ts_1.wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
      Point.BASE.precompute(8);
      return Point;
    }
    function pprefix(hasEvenY) {
      return Uint8Array.of(hasEvenY ? 2 : 3);
    }
    function SWUFpSqrtRatio(Fp, Z) {
      const q = Fp.ORDER;
      let l = _0n2;
      for (let o = q - _1n2; o % _2n2 === _0n2; o /= _2n2)
        l += _1n2;
      const c1 = l;
      const _2n_pow_c1_1 = _2n2 << c1 - _1n2 - _1n2;
      const _2n_pow_c1 = _2n_pow_c1_1 * _2n2;
      const c2 = (q - _1n2) / _2n_pow_c1;
      const c3 = (c2 - _1n2) / _2n2;
      const c4 = _2n_pow_c1 - _1n2;
      const c5 = _2n_pow_c1_1;
      const c6 = Fp.pow(Z, c2);
      const c7 = Fp.pow(Z, (c2 + _1n2) / _2n2);
      let sqrtRatio = (u, v) => {
        let tv1 = c6;
        let tv2 = Fp.pow(v, c4);
        let tv3 = Fp.sqr(tv2);
        tv3 = Fp.mul(tv3, v);
        let tv5 = Fp.mul(u, tv3);
        tv5 = Fp.pow(tv5, c3);
        tv5 = Fp.mul(tv5, tv2);
        tv2 = Fp.mul(tv5, v);
        tv3 = Fp.mul(tv5, u);
        let tv4 = Fp.mul(tv3, tv2);
        tv5 = Fp.pow(tv4, c5);
        let isQR = Fp.eql(tv5, Fp.ONE);
        tv2 = Fp.mul(tv3, c7);
        tv5 = Fp.mul(tv4, tv1);
        tv3 = Fp.cmov(tv2, tv3, isQR);
        tv4 = Fp.cmov(tv5, tv4, isQR);
        for (let i = c1; i > _1n2; i--) {
          let tv52 = i - _2n2;
          tv52 = _2n2 << tv52 - _1n2;
          let tvv5 = Fp.pow(tv4, tv52);
          const e1 = Fp.eql(tvv5, Fp.ONE);
          tv2 = Fp.mul(tv3, tv1);
          tv1 = Fp.mul(tv1, tv1);
          tvv5 = Fp.mul(tv4, tv1);
          tv3 = Fp.cmov(tv2, tv3, e1);
          tv4 = Fp.cmov(tvv5, tv4, e1);
        }
        return { isValid: isQR, value: tv3 };
      };
      if (Fp.ORDER % _4n === _3n) {
        const c12 = (Fp.ORDER - _3n) / _4n;
        const c22 = Fp.sqrt(Fp.neg(Z));
        sqrtRatio = (u, v) => {
          let tv1 = Fp.sqr(v);
          const tv2 = Fp.mul(u, v);
          tv1 = Fp.mul(tv1, tv2);
          let y1 = Fp.pow(tv1, c12);
          y1 = Fp.mul(y1, tv2);
          const y2 = Fp.mul(y1, c22);
          const tv3 = Fp.mul(Fp.sqr(y1), v);
          const isQR = Fp.eql(tv3, u);
          let y = Fp.cmov(y2, y1, isQR);
          return { isValid: isQR, value: y };
        };
      }
      return sqrtRatio;
    }
    function mapToCurveSimpleSWU(Fp, opts) {
      (0, modular_ts_1.validateField)(Fp);
      const { A, B, Z } = opts;
      if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z))
        throw new Error("mapToCurveSimpleSWU: invalid opts");
      const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
      if (!Fp.isOdd)
        throw new Error("Field does not have .isOdd()");
      return (u) => {
        let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
        tv1 = Fp.sqr(u);
        tv1 = Fp.mul(tv1, Z);
        tv2 = Fp.sqr(tv1);
        tv2 = Fp.add(tv2, tv1);
        tv3 = Fp.add(tv2, Fp.ONE);
        tv3 = Fp.mul(tv3, B);
        tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
        tv4 = Fp.mul(tv4, A);
        tv2 = Fp.sqr(tv3);
        tv6 = Fp.sqr(tv4);
        tv5 = Fp.mul(tv6, A);
        tv2 = Fp.add(tv2, tv5);
        tv2 = Fp.mul(tv2, tv3);
        tv6 = Fp.mul(tv6, tv4);
        tv5 = Fp.mul(tv6, B);
        tv2 = Fp.add(tv2, tv5);
        x = Fp.mul(tv1, tv3);
        const { isValid, value } = sqrtRatio(tv2, tv6);
        y = Fp.mul(tv1, u);
        y = Fp.mul(y, value);
        x = Fp.cmov(x, tv3, isValid);
        y = Fp.cmov(y, value, isValid);
        const e1 = Fp.isOdd(u) === Fp.isOdd(y);
        y = Fp.cmov(Fp.neg(y), y, e1);
        const tv4_inv = (0, modular_ts_1.FpInvertBatch)(Fp, [tv4], true)[0];
        x = Fp.mul(x, tv4_inv);
        return { x, y };
      };
    }
    function getWLengths(Fp, Fn) {
      return {
        secretKey: Fn.BYTES,
        publicKey: 1 + Fp.BYTES,
        publicKeyUncompressed: 1 + 2 * Fp.BYTES,
        publicKeyHasPrefix: true,
        signature: 2 * Fn.BYTES
      };
    }
    function ecdh(Point, ecdhOpts = {}) {
      const { Fn } = Point;
      const randomBytes_ = ecdhOpts.randomBytes || utils_ts_1.randomBytes;
      const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: (0, modular_ts_1.getMinHashLength)(Fn.ORDER) });
      function isValidSecretKey(secretKey) {
        try {
          return !!_normFnElement(Fn, secretKey);
        } catch (error) {
          return false;
        }
      }
      function isValidPublicKey(publicKey, isCompressed) {
        const { publicKey: comp, publicKeyUncompressed } = lengths;
        try {
          const l = publicKey.length;
          if (isCompressed === true && l !== comp)
            return false;
          if (isCompressed === false && l !== publicKeyUncompressed)
            return false;
          return !!Point.fromBytes(publicKey);
        } catch (error) {
          return false;
        }
      }
      function randomSecretKey(seed = randomBytes_(lengths.seed)) {
        return (0, modular_ts_1.mapHashToField)((0, utils_ts_1._abytes2)(seed, lengths.seed, "seed"), Fn.ORDER);
      }
      function getPublicKey(secretKey, isCompressed = true) {
        return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
      }
      function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return { secretKey, publicKey: getPublicKey(secretKey) };
      }
      function isProbPub(item) {
        if (typeof item === "bigint")
          return false;
        if (item instanceof Point)
          return true;
        const { secretKey, publicKey, publicKeyUncompressed } = lengths;
        if (Fn.allowedLengths || secretKey === publicKey)
          return void 0;
        const l = (0, utils_ts_1.ensureBytes)("key", item).length;
        return l === publicKey || l === publicKeyUncompressed;
      }
      function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
        if (isProbPub(secretKeyA) === true)
          throw new Error("first arg must be private key");
        if (isProbPub(publicKeyB) === false)
          throw new Error("second arg must be public key");
        const s = _normFnElement(Fn, secretKeyA);
        const b = Point.fromHex(publicKeyB);
        return b.multiply(s).toBytes(isCompressed);
      }
      const utils = {
        isValidSecretKey,
        isValidPublicKey,
        randomSecretKey,
        // TODO: remove
        isValidPrivateKey: isValidSecretKey,
        randomPrivateKey: randomSecretKey,
        normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
        precompute(windowSize = 8, point = Point.BASE) {
          return point.precompute(windowSize, false);
        }
      };
      return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
    }
    function ecdsa(Point, hash, ecdsaOpts = {}) {
      (0, utils_1.ahash)(hash);
      (0, utils_ts_1._validateObject)(ecdsaOpts, {}, {
        hmac: "function",
        lowS: "boolean",
        randomBytes: "function",
        bits2int: "function",
        bits2int_modN: "function"
      });
      const randomBytes3 = ecdsaOpts.randomBytes || utils_ts_1.randomBytes;
      const hmac = ecdsaOpts.hmac || ((key, ...msgs) => (0, hmac_js_1.hmac)(hash, key, (0, utils_ts_1.concatBytes)(...msgs)));
      const { Fp, Fn } = Point;
      const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
      const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
      const defaultSigOpts = {
        prehash: false,
        lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
        format: void 0,
        //'compact' as ECDSASigFormat,
        extraEntropy: false
      };
      const defaultSigOpts_format = "compact";
      function isBiggerThanHalfOrder(number2) {
        const HALF = CURVE_ORDER >> _1n2;
        return number2 > HALF;
      }
      function validateRS(title, num) {
        if (!Fn.isValidNot0(num))
          throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
        return num;
      }
      function validateSigLength(bytes, format) {
        validateSigFormat(format);
        const size = lengths.signature;
        const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
        return (0, utils_ts_1._abytes2)(bytes, sizer, `${format} signature`);
      }
      class Signature {
        constructor(r, s, recovery) {
          this.r = validateRS("r", r);
          this.s = validateRS("s", s);
          if (recovery != null)
            this.recovery = recovery;
          Object.freeze(this);
        }
        static fromBytes(bytes, format = defaultSigOpts_format) {
          validateSigLength(bytes, format);
          let recid;
          if (format === "der") {
            const { r: r2, s: s2 } = exports2.DER.toSig((0, utils_ts_1._abytes2)(bytes));
            return new Signature(r2, s2);
          }
          if (format === "recovered") {
            recid = bytes[0];
            format = "compact";
            bytes = bytes.subarray(1);
          }
          const L = Fn.BYTES;
          const r = bytes.subarray(0, L);
          const s = bytes.subarray(L, L * 2);
          return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
        }
        static fromHex(hex, format) {
          return this.fromBytes((0, utils_ts_1.hexToBytes)(hex), format);
        }
        addRecoveryBit(recovery) {
          return new Signature(this.r, this.s, recovery);
        }
        recoverPublicKey(messageHash) {
          const FIELD_ORDER = Fp.ORDER;
          const { r, s, recovery: rec } = this;
          if (rec == null || ![0, 1, 2, 3].includes(rec))
            throw new Error("recovery id invalid");
          const hasCofactor = CURVE_ORDER * _2n2 < FIELD_ORDER;
          if (hasCofactor && rec > 1)
            throw new Error("recovery id is ambiguous for h>1 curve");
          const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
          if (!Fp.isValid(radj))
            throw new Error("recovery id 2 or 3 invalid");
          const x = Fp.toBytes(radj);
          const R = Point.fromBytes((0, utils_ts_1.concatBytes)(pprefix((rec & 1) === 0), x));
          const ir = Fn.inv(radj);
          const h2 = bits2int_modN((0, utils_ts_1.ensureBytes)("msgHash", messageHash));
          const u1 = Fn.create(-h2 * ir);
          const u2 = Fn.create(s * ir);
          const Q2 = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
          if (Q2.is0())
            throw new Error("point at infinify");
          Q2.assertValidity();
          return Q2;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
          return isBiggerThanHalfOrder(this.s);
        }
        toBytes(format = defaultSigOpts_format) {
          validateSigFormat(format);
          if (format === "der")
            return (0, utils_ts_1.hexToBytes)(exports2.DER.hexFromSig(this));
          const r = Fn.toBytes(this.r);
          const s = Fn.toBytes(this.s);
          if (format === "recovered") {
            if (this.recovery == null)
              throw new Error("recovery bit must be present");
            return (0, utils_ts_1.concatBytes)(Uint8Array.of(this.recovery), r, s);
          }
          return (0, utils_ts_1.concatBytes)(r, s);
        }
        toHex(format) {
          return (0, utils_ts_1.bytesToHex)(this.toBytes(format));
        }
        // TODO: remove
        assertValidity() {
        }
        static fromCompact(hex) {
          return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "compact");
        }
        static fromDER(hex) {
          return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "der");
        }
        normalizeS() {
          return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
        }
        toDERRawBytes() {
          return this.toBytes("der");
        }
        toDERHex() {
          return (0, utils_ts_1.bytesToHex)(this.toBytes("der"));
        }
        toCompactRawBytes() {
          return this.toBytes("compact");
        }
        toCompactHex() {
          return (0, utils_ts_1.bytesToHex)(this.toBytes("compact"));
        }
      }
      const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
        if (bytes.length > 8192)
          throw new Error("input is too large");
        const num = (0, utils_ts_1.bytesToNumberBE)(bytes);
        const delta = bytes.length * 8 - fnBits;
        return delta > 0 ? num >> BigInt(delta) : num;
      };
      const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
        return Fn.create(bits2int(bytes));
      };
      const ORDER_MASK = (0, utils_ts_1.bitMask)(fnBits);
      function int2octets(num) {
        (0, utils_ts_1.aInRange)("num < 2^" + fnBits, num, _0n2, ORDER_MASK);
        return Fn.toBytes(num);
      }
      function validateMsgAndHash(message, prehash) {
        (0, utils_ts_1._abytes2)(message, void 0, "message");
        return prehash ? (0, utils_ts_1._abytes2)(hash(message), void 0, "prehashed message") : message;
      }
      function prepSig(message, privateKey, opts) {
        if (["recovered", "canonical"].some((k) => k in opts))
          throw new Error("sign() legacy options not supported");
        const { lowS, prehash, extraEntropy } = validateSigOpts2(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash);
        const h1int = bits2int_modN(message);
        const d = _normFnElement(Fn, privateKey);
        const seedArgs = [int2octets(d), int2octets(h1int)];
        if (extraEntropy != null && extraEntropy !== false) {
          const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
          seedArgs.push((0, utils_ts_1.ensureBytes)("extraEntropy", e));
        }
        const seed = (0, utils_ts_1.concatBytes)(...seedArgs);
        const m = h1int;
        function k2sig(kBytes) {
          const k = bits2int(kBytes);
          if (!Fn.isValidNot0(k))
            return;
          const ik = Fn.inv(k);
          const q = Point.BASE.multiply(k).toAffine();
          const r = Fn.create(q.x);
          if (r === _0n2)
            return;
          const s = Fn.create(ik * Fn.create(m + r * d));
          if (s === _0n2)
            return;
          let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n2);
          let normS = s;
          if (lowS && isBiggerThanHalfOrder(s)) {
            normS = Fn.neg(s);
            recovery ^= 1;
          }
          return new Signature(r, normS, recovery);
        }
        return { seed, k2sig };
      }
      function sign2(message, secretKey, opts = {}) {
        message = (0, utils_ts_1.ensureBytes)("message", message);
        const { seed, k2sig } = prepSig(message, secretKey, opts);
        const drbg = (0, utils_ts_1.createHmacDrbg)(hash.outputLen, Fn.BYTES, hmac);
        const sig = drbg(seed, k2sig);
        return sig;
      }
      function tryParsingSig(sg) {
        let sig = void 0;
        const isHex = typeof sg === "string" || (0, utils_ts_1.isBytes)(sg);
        const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
        if (!isHex && !isObj)
          throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
        if (isObj) {
          sig = new Signature(sg.r, sg.s);
        } else if (isHex) {
          try {
            sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "der");
          } catch (derError) {
            if (!(derError instanceof exports2.DER.Err))
              throw derError;
          }
          if (!sig) {
            try {
              sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "compact");
            } catch (error) {
              return false;
            }
          }
        }
        if (!sig)
          return false;
        return sig;
      }
      function verify(signature, message, publicKey, opts = {}) {
        const { lowS, prehash, format } = validateSigOpts2(opts, defaultSigOpts);
        publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey);
        message = validateMsgAndHash((0, utils_ts_1.ensureBytes)("message", message), prehash);
        if ("strict" in opts)
          throw new Error("options.strict was renamed to lowS");
        const sig = format === void 0 ? tryParsingSig(signature) : Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", signature), format);
        if (sig === false)
          return false;
        try {
          const P = Point.fromBytes(publicKey);
          if (lowS && sig.hasHighS())
            return false;
          const { r, s } = sig;
          const h2 = bits2int_modN(message);
          const is = Fn.inv(s);
          const u1 = Fn.create(h2 * is);
          const u2 = Fn.create(r * is);
          const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
          if (R.is0())
            return false;
          const v = Fn.create(R.x);
          return v === r;
        } catch (e) {
          return false;
        }
      }
      function recoverPublicKey(signature, message, opts = {}) {
        const { prehash } = validateSigOpts2(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash);
        return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
      }
      return Object.freeze({
        keygen,
        getPublicKey,
        getSharedSecret,
        utils,
        lengths,
        Point,
        sign: sign2,
        verify,
        recoverPublicKey,
        Signature,
        hash
      });
    }
    function weierstrassPoints(c) {
      const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
      const Point = weierstrassN(CURVE, curveOpts);
      return _weierstrass_new_output_to_legacy(c, Point);
    }
    function _weierstrass_legacy_opts_to_new(c) {
      const CURVE = {
        a: c.a,
        b: c.b,
        p: c.Fp.ORDER,
        n: c.n,
        h: c.h,
        Gx: c.Gx,
        Gy: c.Gy
      };
      const Fp = c.Fp;
      let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
      const Fn = (0, modular_ts_1.Field)(CURVE.n, {
        BITS: c.nBitLength,
        allowedLengths,
        modFromBytes: c.wrapPrivateKey
      });
      const curveOpts = {
        Fp,
        Fn,
        allowInfinityPoint: c.allowInfinityPoint,
        endo: c.endo,
        isTorsionFree: c.isTorsionFree,
        clearCofactor: c.clearCofactor,
        fromBytes: c.fromBytes,
        toBytes: c.toBytes
      };
      return { CURVE, curveOpts };
    }
    function _ecdsa_legacy_opts_to_new(c) {
      const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
      const ecdsaOpts = {
        hmac: c.hmac,
        randomBytes: c.randomBytes,
        lowS: c.lowS,
        bits2int: c.bits2int,
        bits2int_modN: c.bits2int_modN
      };
      return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
    }
    function _legacyHelperEquat(Fp, a, b) {
      function weierstrassEquation(x) {
        const x2 = Fp.sqr(x);
        const x3 = Fp.mul(x2, x);
        return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
      }
      return weierstrassEquation;
    }
    function _weierstrass_new_output_to_legacy(c, Point) {
      const { Fp, Fn } = Point;
      function isWithinCurveOrder(num) {
        return (0, utils_ts_1.inRange)(num, _1n2, Fn.ORDER);
      }
      const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
      return Object.assign({}, {
        CURVE: c,
        Point,
        ProjectivePoint: Point,
        normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
        weierstrassEquation,
        isWithinCurveOrder
      });
    }
    function _ecdsa_new_output_to_legacy(c, _ecdsa) {
      const Point = _ecdsa.Point;
      return Object.assign({}, _ecdsa, {
        ProjectivePoint: Point,
        CURVE: Object.assign({}, c, (0, modular_ts_1.nLength)(Point.Fn.ORDER, Point.Fn.BITS))
      });
    }
    function weierstrass(c) {
      const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
      const Point = weierstrassN(CURVE, curveOpts);
      const signs = ecdsa(Point, hash, ecdsaOpts);
      return _ecdsa_new_output_to_legacy(c, signs);
    }
  }
});

// node_modules/@noble/curves/_shortw_utils.js
var require_shortw_utils = __commonJS({
  "node_modules/@noble/curves/_shortw_utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getHash = getHash;
    exports2.createCurve = createCurve;
    var weierstrass_ts_1 = require_weierstrass();
    function getHash(hash) {
      return { hash };
    }
    function createCurve(curveDef, defHash) {
      const create = (hash) => (0, weierstrass_ts_1.weierstrass)({ ...curveDef, hash });
      return { ...create(defHash), create };
    }
  }
});

// node_modules/@noble/curves/abstract/hash-to-curve.js
var require_hash_to_curve = __commonJS({
  "node_modules/@noble/curves/abstract/hash-to-curve.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._DST_scalar = void 0;
    exports2.expand_message_xmd = expand_message_xmd;
    exports2.expand_message_xof = expand_message_xof;
    exports2.hash_to_field = hash_to_field;
    exports2.isogenyMap = isogenyMap;
    exports2.createHasher = createHasher3;
    var utils_ts_1 = require_utils3();
    var modular_ts_1 = require_modular();
    var os2ip = utils_ts_1.bytesToNumberBE;
    function i2osp(value, length2) {
      anum(value);
      anum(length2);
      if (value < 0 || value >= 1 << 8 * length2)
        throw new Error("invalid I2OSP input: " + value);
      const res = Array.from({ length: length2 }).fill(0);
      for (let i = length2 - 1; i >= 0; i--) {
        res[i] = value & 255;
        value >>>= 8;
      }
      return new Uint8Array(res);
    }
    function strxor(a, b) {
      const arr = new Uint8Array(a.length);
      for (let i = 0; i < a.length; i++) {
        arr[i] = a[i] ^ b[i];
      }
      return arr;
    }
    function anum(item) {
      if (!Number.isSafeInteger(item))
        throw new Error("number expected");
    }
    function normDST(DST) {
      if (!(0, utils_ts_1.isBytes)(DST) && typeof DST !== "string")
        throw new Error("DST must be Uint8Array or string");
      return typeof DST === "string" ? (0, utils_ts_1.utf8ToBytes)(DST) : DST;
    }
    function expand_message_xmd(msg, DST, lenInBytes, H) {
      (0, utils_ts_1.abytes)(msg);
      anum(lenInBytes);
      DST = normDST(DST);
      if (DST.length > 255)
        DST = H((0, utils_ts_1.concatBytes)((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
      const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
      const ell = Math.ceil(lenInBytes / b_in_bytes);
      if (lenInBytes > 65535 || ell > 255)
        throw new Error("expand_message_xmd: invalid lenInBytes");
      const DST_prime = (0, utils_ts_1.concatBytes)(DST, i2osp(DST.length, 1));
      const Z_pad = i2osp(0, r_in_bytes);
      const l_i_b_str = i2osp(lenInBytes, 2);
      const b = new Array(ell);
      const b_0 = H((0, utils_ts_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
      b[0] = H((0, utils_ts_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
      for (let i = 1; i <= ell; i++) {
        const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
        b[i] = H((0, utils_ts_1.concatBytes)(...args));
      }
      const pseudo_random_bytes = (0, utils_ts_1.concatBytes)(...b);
      return pseudo_random_bytes.slice(0, lenInBytes);
    }
    function expand_message_xof(msg, DST, lenInBytes, k, H) {
      (0, utils_ts_1.abytes)(msg);
      anum(lenInBytes);
      DST = normDST(DST);
      if (DST.length > 255) {
        const dkLen = Math.ceil(2 * k / 8);
        DST = H.create({ dkLen }).update((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
      }
      if (lenInBytes > 65535 || DST.length > 255)
        throw new Error("expand_message_xof: invalid lenInBytes");
      return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
    }
    function hash_to_field(msg, count, options) {
      (0, utils_ts_1._validateObject)(options, {
        p: "bigint",
        m: "number",
        k: "number",
        hash: "function"
      });
      const { p, k, m, hash, expand, DST } = options;
      if (!(0, utils_ts_1.isHash)(options.hash))
        throw new Error("expected valid hash");
      (0, utils_ts_1.abytes)(msg);
      anum(count);
      const log2p = p.toString(2).length;
      const L = Math.ceil((log2p + k) / 8);
      const len_in_bytes = count * m * L;
      let prb;
      if (expand === "xmd") {
        prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
      } else if (expand === "xof") {
        prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
      } else if (expand === "_internal_pass") {
        prb = msg;
      } else {
        throw new Error('expand must be "xmd" or "xof"');
      }
      const u = new Array(count);
      for (let i = 0; i < count; i++) {
        const e = new Array(m);
        for (let j = 0; j < m; j++) {
          const elm_offset = L * (j + i * m);
          const tv = prb.subarray(elm_offset, elm_offset + L);
          e[j] = (0, modular_ts_1.mod)(os2ip(tv), p);
        }
        u[i] = e;
      }
      return u;
    }
    function isogenyMap(field, map) {
      const coeff = map.map((i) => Array.from(i).reverse());
      return (x, y) => {
        const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
        const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(field, [xd, yd], true);
        x = field.mul(xn, xd_inv);
        y = field.mul(y, field.mul(yn, yd_inv));
        return { x, y };
      };
    }
    exports2._DST_scalar = (0, utils_ts_1.utf8ToBytes)("HashToScalar-");
    function createHasher3(Point, mapToCurve, defaults) {
      if (typeof mapToCurve !== "function")
        throw new Error("mapToCurve() must be defined");
      function map(num) {
        return Point.fromAffine(mapToCurve(num));
      }
      function clear(initial) {
        const P = initial.clearCofactor();
        if (P.equals(Point.ZERO))
          return Point.ZERO;
        P.assertValidity();
        return P;
      }
      return {
        defaults,
        hashToCurve(msg, options) {
          const opts = Object.assign({}, defaults, options);
          const u = hash_to_field(msg, 2, opts);
          const u0 = map(u[0]);
          const u1 = map(u[1]);
          return clear(u0.add(u1));
        },
        encodeToCurve(msg, options) {
          const optsDst = defaults.encodeDST ? { DST: defaults.encodeDST } : {};
          const opts = Object.assign({}, defaults, optsDst, options);
          const u = hash_to_field(msg, 1, opts);
          const u0 = map(u[0]);
          return clear(u0);
        },
        /** See {@link H2CHasher} */
        mapToCurve(scalars) {
          if (!Array.isArray(scalars))
            throw new Error("expected array of bigints");
          for (const i of scalars)
            if (typeof i !== "bigint")
              throw new Error("expected array of bigints");
          return clear(map(scalars));
        },
        // hash_to_scalar can produce 0: https://www.rfc-editor.org/errata/eid8393
        // RFC 9380, draft-irtf-cfrg-bbs-signatures-08
        hashToScalar(msg, options) {
          const N2 = Point.Fn.ORDER;
          const opts = Object.assign({}, defaults, { p: N2, m: 1, DST: exports2._DST_scalar }, options);
          return hash_to_field(msg, 1, opts)[0][0];
        }
      };
    }
  }
});

// node_modules/@noble/curves/secp256k1.js
var require_secp256k1 = __commonJS({
  "node_modules/@noble/curves/secp256k1.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encodeToCurve = exports2.hashToCurve = exports2.secp256k1_hasher = exports2.schnorr = exports2.secp256k1 = void 0;
    var sha2_js_1 = require_sha2();
    var utils_js_1 = require_utils();
    var _shortw_utils_ts_1 = require_shortw_utils();
    var hash_to_curve_ts_1 = require_hash_to_curve();
    var modular_ts_1 = require_modular();
    var weierstrass_ts_1 = require_weierstrass();
    var utils_ts_1 = require_utils3();
    var secp256k1_CURVE = {
      p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
      n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
      h: BigInt(1),
      a: BigInt(0),
      b: BigInt(7),
      Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
      Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
    };
    var secp256k1_ENDO = {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      basises: [
        [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
        [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
      ]
    };
    var _0n2 = /* @__PURE__ */ BigInt(0);
    var _1n2 = /* @__PURE__ */ BigInt(1);
    var _2n2 = /* @__PURE__ */ BigInt(2);
    function sqrtMod(y) {
      const P = secp256k1_CURVE.p;
      const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
      const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
      const b2 = y * y * y % P;
      const b3 = b2 * b2 * y % P;
      const b6 = (0, modular_ts_1.pow2)(b3, _3n, P) * b3 % P;
      const b9 = (0, modular_ts_1.pow2)(b6, _3n, P) * b3 % P;
      const b11 = (0, modular_ts_1.pow2)(b9, _2n2, P) * b2 % P;
      const b22 = (0, modular_ts_1.pow2)(b11, _11n, P) * b11 % P;
      const b44 = (0, modular_ts_1.pow2)(b22, _22n, P) * b22 % P;
      const b88 = (0, modular_ts_1.pow2)(b44, _44n, P) * b44 % P;
      const b176 = (0, modular_ts_1.pow2)(b88, _88n, P) * b88 % P;
      const b220 = (0, modular_ts_1.pow2)(b176, _44n, P) * b44 % P;
      const b223 = (0, modular_ts_1.pow2)(b220, _3n, P) * b3 % P;
      const t1 = (0, modular_ts_1.pow2)(b223, _23n, P) * b22 % P;
      const t2 = (0, modular_ts_1.pow2)(t1, _6n, P) * b2 % P;
      const root = (0, modular_ts_1.pow2)(t2, _2n2, P);
      if (!Fpk1.eql(Fpk1.sqr(root), y))
        throw new Error("Cannot find square root");
      return root;
    }
    var Fpk1 = (0, modular_ts_1.Field)(secp256k1_CURVE.p, { sqrt: sqrtMod });
    exports2.secp256k1 = (0, _shortw_utils_ts_1.createCurve)({ ...secp256k1_CURVE, Fp: Fpk1, lowS: true, endo: secp256k1_ENDO }, sha2_js_1.sha256);
    var TAGGED_HASH_PREFIXES = {};
    function taggedHash(tag, ...messages) {
      let tagP = TAGGED_HASH_PREFIXES[tag];
      if (tagP === void 0) {
        const tagH = (0, sha2_js_1.sha256)((0, utils_ts_1.utf8ToBytes)(tag));
        tagP = (0, utils_ts_1.concatBytes)(tagH, tagH);
        TAGGED_HASH_PREFIXES[tag] = tagP;
      }
      return (0, sha2_js_1.sha256)((0, utils_ts_1.concatBytes)(tagP, ...messages));
    }
    var pointToBytes = (point) => point.toBytes(true).slice(1);
    var Pointk1 = /* @__PURE__ */ (() => exports2.secp256k1.Point)();
    var hasEven = (y) => y % _2n2 === _0n2;
    function schnorrGetExtPubKey(priv) {
      const { Fn, BASE } = Pointk1;
      const d_ = (0, weierstrass_ts_1._normFnElement)(Fn, priv);
      const p = BASE.multiply(d_);
      const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
      return { scalar, bytes: pointToBytes(p) };
    }
    function lift_x(x) {
      const Fp = Fpk1;
      if (!Fp.isValidNot0(x))
        throw new Error("invalid x: Fail if x \u2265 p");
      const xx = Fp.create(x * x);
      const c = Fp.create(xx * x + BigInt(7));
      let y = Fp.sqrt(c);
      if (!hasEven(y))
        y = Fp.neg(y);
      const p = Pointk1.fromAffine({ x, y });
      p.assertValidity();
      return p;
    }
    var num = utils_ts_1.bytesToNumberBE;
    function challenge(...args) {
      return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
    }
    function schnorrGetPublicKey(secretKey) {
      return schnorrGetExtPubKey(secretKey).bytes;
    }
    function schnorrSign(message, secretKey, auxRand = (0, utils_js_1.randomBytes)(32)) {
      const { Fn } = Pointk1;
      const m = (0, utils_ts_1.ensureBytes)("message", message);
      const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
      const a = (0, utils_ts_1.ensureBytes)("auxRand", auxRand, 32);
      const t = Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a)));
      const rand = taggedHash("BIP0340/nonce", t, px, m);
      const { bytes: rx, scalar: k } = schnorrGetExtPubKey(rand);
      const e = challenge(rx, px, m);
      const sig = new Uint8Array(64);
      sig.set(rx, 0);
      sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
      if (!schnorrVerify(sig, m, px))
        throw new Error("sign: Invalid signature produced");
      return sig;
    }
    function schnorrVerify(signature, message, publicKey) {
      const { Fn, BASE } = Pointk1;
      const sig = (0, utils_ts_1.ensureBytes)("signature", signature, 64);
      const m = (0, utils_ts_1.ensureBytes)("message", message);
      const pub = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, 32);
      try {
        const P = lift_x(num(pub));
        const r = num(sig.subarray(0, 32));
        if (!(0, utils_ts_1.inRange)(r, _1n2, secp256k1_CURVE.p))
          return false;
        const s = num(sig.subarray(32, 64));
        if (!(0, utils_ts_1.inRange)(s, _1n2, secp256k1_CURVE.n))
          return false;
        const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
        const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
        const { x, y } = R.toAffine();
        if (R.is0() || !hasEven(y) || x !== r)
          return false;
        return true;
      } catch (error) {
        return false;
      }
    }
    exports2.schnorr = (() => {
      const size = 32;
      const seedLength = 48;
      const randomSecretKey = (seed = (0, utils_js_1.randomBytes)(seedLength)) => {
        return (0, modular_ts_1.mapHashToField)(seed, secp256k1_CURVE.n);
      };
      exports2.secp256k1.utils.randomSecretKey;
      function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return { secretKey, publicKey: schnorrGetPublicKey(secretKey) };
      }
      return {
        keygen,
        getPublicKey: schnorrGetPublicKey,
        sign: schnorrSign,
        verify: schnorrVerify,
        Point: Pointk1,
        utils: {
          randomSecretKey,
          randomPrivateKey: randomSecretKey,
          taggedHash,
          // TODO: remove
          lift_x,
          pointToBytes,
          numberToBytesBE: utils_ts_1.numberToBytesBE,
          bytesToNumberBE: utils_ts_1.bytesToNumberBE,
          mod: modular_ts_1.mod
        },
        lengths: {
          secretKey: size,
          publicKey: size,
          publicKeyHasPrefix: false,
          signature: size * 2,
          seed: seedLength
        }
      };
    })();
    var isoMap = /* @__PURE__ */ (() => (0, hash_to_curve_ts_1.isogenyMap)(Fpk1, [
      // xNum
      [
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
        "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
        "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
      ],
      // xDen
      [
        "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
        "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ],
      // yNum
      [
        "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
        "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
        "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
        "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
      ],
      // yDen
      [
        "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
        "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
        "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ]
    ].map((i) => i.map((j) => BigInt(j)))))();
    var mapSWU = /* @__PURE__ */ (() => (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fpk1, {
      A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
      B: BigInt("1771"),
      Z: Fpk1.create(BigInt("-11"))
    }))();
    exports2.secp256k1_hasher = (() => (0, hash_to_curve_ts_1.createHasher)(exports2.secp256k1.Point, (scalars) => {
      const { x, y } = mapSWU(Fpk1.create(scalars[0]));
      return isoMap(x, y);
    }, {
      DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
      encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
      p: Fpk1.ORDER,
      m: 1,
      k: 128,
      expand: "xmd",
      hash: sha2_js_1.sha256
    }))();
    exports2.hashToCurve = (() => exports2.secp256k1_hasher.hashToCurve)();
    exports2.encodeToCurve = (() => exports2.secp256k1_hasher.encodeToCurve)();
  }
});

// node_modules/@noble/curves/abstract/utils.js
var require_utils4 = __commonJS({
  "node_modules/@noble/curves/abstract/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isHash = exports2.validateObject = exports2.memoized = exports2.notImplemented = exports2.createHmacDrbg = exports2.bitMask = exports2.bitSet = exports2.bitGet = exports2.bitLen = exports2.aInRange = exports2.inRange = exports2.asciiToBytes = exports2.copyBytes = exports2.equalBytes = exports2.ensureBytes = exports2.numberToVarBytesBE = exports2.numberToBytesLE = exports2.numberToBytesBE = exports2.bytesToNumberLE = exports2.bytesToNumberBE = exports2.hexToNumber = exports2.numberToHexUnpadded = exports2.abool = exports2.utf8ToBytes = exports2.randomBytes = exports2.isBytes = exports2.hexToBytes = exports2.concatBytes = exports2.bytesToUtf8 = exports2.bytesToHex = exports2.anumber = exports2.abytes = void 0;
    var u = require_utils3();
    exports2.abytes = u.abytes;
    exports2.anumber = u.anumber;
    exports2.bytesToHex = u.bytesToHex;
    exports2.bytesToUtf8 = u.bytesToUtf8;
    exports2.concatBytes = u.concatBytes;
    exports2.hexToBytes = u.hexToBytes;
    exports2.isBytes = u.isBytes;
    exports2.randomBytes = u.randomBytes;
    exports2.utf8ToBytes = u.utf8ToBytes;
    exports2.abool = u.abool;
    exports2.numberToHexUnpadded = u.numberToHexUnpadded;
    exports2.hexToNumber = u.hexToNumber;
    exports2.bytesToNumberBE = u.bytesToNumberBE;
    exports2.bytesToNumberLE = u.bytesToNumberLE;
    exports2.numberToBytesBE = u.numberToBytesBE;
    exports2.numberToBytesLE = u.numberToBytesLE;
    exports2.numberToVarBytesBE = u.numberToVarBytesBE;
    exports2.ensureBytes = u.ensureBytes;
    exports2.equalBytes = u.equalBytes;
    exports2.copyBytes = u.copyBytes;
    exports2.asciiToBytes = u.asciiToBytes;
    exports2.inRange = u.inRange;
    exports2.aInRange = u.aInRange;
    exports2.bitLen = u.bitLen;
    exports2.bitGet = u.bitGet;
    exports2.bitSet = u.bitSet;
    exports2.bitMask = u.bitMask;
    exports2.createHmacDrbg = u.createHmacDrbg;
    exports2.notImplemented = u.notImplemented;
    exports2.memoized = u.memoized;
    exports2.validateObject = u.validateObject;
    exports2.isHash = u.isHash;
  }
});

// node_modules/@bitcoinerlab/secp256k1/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@bitcoinerlab/secp256k1/dist/index.js"(exports2) {
    "use strict";
    var secp256k1 = require_secp256k1();
    var mod = require_modular();
    var utils = require_utils4();
    function _interopNamespaceDefault(e) {
      var n = /* @__PURE__ */ Object.create(null);
      if (e) {
        Object.keys(e).forEach(function(k) {
          if (k !== "default") {
            var d = Object.getOwnPropertyDescriptor(e, k);
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: function() {
                return e[k];
              }
            });
          }
        });
      }
      n.default = e;
      return Object.freeze(n);
    }
    var mod__namespace = /* @__PURE__ */ _interopNamespaceDefault(mod);
    var utils__namespace = /* @__PURE__ */ _interopNamespaceDefault(utils);
    var Point = secp256k1.secp256k1.ProjectivePoint;
    var THROW_BAD_PRIVATE = "Expected Private";
    var THROW_BAD_POINT = "Expected Point";
    var THROW_BAD_TWEAK = "Expected Tweak";
    var THROW_BAD_HASH = "Expected Hash";
    var THROW_BAD_SIGNATURE = "Expected Signature";
    var THROW_BAD_EXTRA_DATA = "Expected Extra Data (32 bytes)";
    var THROW_BAD_SCALAR = "Expected Scalar";
    var THROW_BAD_RECOVERY_ID = "Bad Recovery Id";
    var HASH_SIZE = 32;
    var TWEAK_SIZE = 32;
    var BN32_N = new Uint8Array([
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      255,
      254,
      186,
      174,
      220,
      230,
      175,
      72,
      160,
      59,
      191,
      210,
      94,
      140,
      208,
      54,
      65,
      65
    ]);
    var EXTRA_DATA_SIZE = 32;
    var BN32_ZERO = new Uint8Array(32);
    var BN32_P_MINUS_N = new Uint8Array([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      69,
      81,
      35,
      25,
      80,
      183,
      95,
      196,
      64,
      45,
      161,
      114,
      47,
      201,
      186,
      238
    ]);
    var _1n2 = BigInt(1);
    function isUint8Array(value) {
      return value instanceof Uint8Array;
    }
    function cmpBN32(data1, data2) {
      for (let i = 0; i < 32; ++i) {
        if (data1[i] !== data2[i]) {
          return data1[i] < data2[i] ? -1 : 1;
        }
      }
      return 0;
    }
    function isZero(x) {
      return cmpBN32(x, BN32_ZERO) === 0;
    }
    function isTweak(tweak) {
      if (!(tweak instanceof Uint8Array) || tweak.length !== TWEAK_SIZE || cmpBN32(tweak, BN32_N) >= 0) {
        return false;
      }
      return true;
    }
    function isSignature(signature) {
      return signature instanceof Uint8Array && signature.length === 64 && cmpBN32(signature.subarray(0, 32), BN32_N) < 0 && cmpBN32(signature.subarray(32, 64), BN32_N) < 0;
    }
    function isSigrLessThanPMinusN(signature) {
      return isUint8Array(signature) && signature.length === 64 && cmpBN32(signature.subarray(0, 32), BN32_P_MINUS_N) < 0;
    }
    function isSignatureNonzeroRS(signature) {
      return !(isZero(signature.subarray(0, 32)) || isZero(signature.subarray(32, 64)));
    }
    function isHash(h2) {
      return h2 instanceof Uint8Array && h2.length === HASH_SIZE;
    }
    function isExtraData(e) {
      return e === void 0 || e instanceof Uint8Array && e.length === EXTRA_DATA_SIZE;
    }
    function normalizeScalar(scalar) {
      let num;
      if (typeof scalar === "bigint") {
        num = scalar;
      } else if (typeof scalar === "number" && Number.isSafeInteger(scalar) && scalar >= 0) {
        num = BigInt(scalar);
      } else if (typeof scalar === "string") {
        if (scalar.length !== 64)
          throw new Error("Expected 32 bytes of private scalar");
        num = utils__namespace.hexToNumber(scalar);
      } else if (scalar instanceof Uint8Array) {
        if (scalar.length !== 32)
          throw new Error("Expected 32 bytes of private scalar");
        num = utils__namespace.bytesToNumberBE(scalar);
      } else {
        throw new TypeError("Expected valid private scalar");
      }
      if (num < 0) throw new Error("Expected private scalar >= 0");
      return num;
    }
    function normalizePrivateKey(privateKey) {
      return secp256k1.secp256k1.utils.normPrivateKeyToScalar(privateKey);
    }
    function _privateAdd(privateKey, tweak) {
      const p = normalizePrivateKey(privateKey);
      const t = normalizeScalar(tweak);
      const add = utils__namespace.numberToBytesBE(mod__namespace.mod(p + t, secp256k1.secp256k1.CURVE.n), 32);
      return secp256k1.secp256k1.utils.isValidPrivateKey(add) ? add : null;
    }
    function _privateSub(privateKey, tweak) {
      const p = normalizePrivateKey(privateKey);
      const t = normalizeScalar(tweak);
      const sub = utils__namespace.numberToBytesBE(mod__namespace.mod(p - t, secp256k1.secp256k1.CURVE.n), 32);
      return secp256k1.secp256k1.utils.isValidPrivateKey(sub) ? sub : null;
    }
    function _privateNegate(privateKey) {
      const p = normalizePrivateKey(privateKey);
      const not = utils__namespace.numberToBytesBE(secp256k1.secp256k1.CURVE.n - p, 32);
      return secp256k1.secp256k1.utils.isValidPrivateKey(not) ? not : null;
    }
    function _pointAddScalar(p, tweak, isCompressed) {
      const P = fromHex(p);
      const t = normalizeScalar(tweak);
      const Q2 = Point.BASE.multiplyAndAddUnsafe(P, t, _1n2);
      if (!Q2) throw new Error("Tweaked point at infinity");
      return Q2.toRawBytes(isCompressed);
    }
    function _pointMultiply(p, tweak, isCompressed) {
      const P = fromHex(p);
      const h2 = typeof tweak === "string" ? tweak : utils__namespace.bytesToHex(tweak);
      const t = utils__namespace.hexToNumber(h2);
      return P.multiply(t).toRawBytes(isCompressed);
    }
    function assumeCompression(compressed, p) {
      if (compressed === void 0) {
        return p !== void 0 ? isPointCompressed(p) : true;
      }
      return !!compressed;
    }
    function throwToNull(fn) {
      try {
        return fn();
      } catch (e) {
        return null;
      }
    }
    function fromXOnly(bytes) {
      return secp256k1.schnorr.utils.lift_x(utils__namespace.bytesToNumberBE(bytes));
    }
    function fromHex(bytes) {
      return bytes.length === 32 ? fromXOnly(bytes) : Point.fromHex(bytes);
    }
    function _isPoint(p, xOnly) {
      if (p.length === 32 !== xOnly) return false;
      try {
        if (xOnly) return !!fromXOnly(p);
        else return !!Point.fromHex(p);
      } catch (e) {
        return false;
      }
    }
    function isPoint(p) {
      return _isPoint(p, false);
    }
    function isPointCompressed(p) {
      const PUBLIC_KEY_COMPRESSED_SIZE = 33;
      return _isPoint(p, false) && p.length === PUBLIC_KEY_COMPRESSED_SIZE;
    }
    function isPrivate(d) {
      return secp256k1.secp256k1.utils.isValidPrivateKey(d);
    }
    function isXOnlyPoint(p) {
      return _isPoint(p, true);
    }
    function xOnlyPointAddTweak(p, tweak) {
      if (!isXOnlyPoint(p)) {
        throw new Error(THROW_BAD_POINT);
      }
      if (!isTweak(tweak)) {
        throw new Error(THROW_BAD_TWEAK);
      }
      return throwToNull(() => {
        const P = _pointAddScalar(p, tweak, true);
        const parity = P[0] % 2 === 1 ? 1 : 0;
        return { parity, xOnlyPubkey: P.slice(1) };
      });
    }
    function xOnlyPointFromPoint(p) {
      if (!isPoint(p)) {
        throw new Error(THROW_BAD_POINT);
      }
      return p.slice(1, 33);
    }
    function pointFromScalar(sk, compressed) {
      if (!isPrivate(sk)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      return throwToNull(
        () => secp256k1.secp256k1.getPublicKey(sk, assumeCompression(compressed))
      );
    }
    function xOnlyPointFromScalar(d) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      return xOnlyPointFromPoint(pointFromScalar(d));
    }
    function pointCompress(p, compressed) {
      if (!isPoint(p)) {
        throw new Error(THROW_BAD_POINT);
      }
      return fromHex(p).toRawBytes(assumeCompression(compressed, p));
    }
    function pointMultiply(a, tweak, compressed) {
      if (!isPoint(a)) {
        throw new Error(THROW_BAD_POINT);
      }
      if (!isTweak(tweak)) {
        throw new Error(THROW_BAD_TWEAK);
      }
      return throwToNull(
        () => _pointMultiply(a, tweak, assumeCompression(compressed, a))
      );
    }
    function pointAdd(a, b, compressed) {
      if (!isPoint(a) || !isPoint(b)) {
        throw new Error(THROW_BAD_POINT);
      }
      return throwToNull(() => {
        const A = fromHex(a);
        const B = fromHex(b);
        if (A.equals(B.negate())) {
          return null;
        } else {
          return A.add(B).toRawBytes(assumeCompression(compressed, a));
        }
      });
    }
    function pointAddScalar(p, tweak, compressed) {
      if (!isPoint(p)) {
        throw new Error(THROW_BAD_POINT);
      }
      if (!isTweak(tweak)) {
        throw new Error(THROW_BAD_TWEAK);
      }
      return throwToNull(
        () => _pointAddScalar(p, tweak, assumeCompression(compressed, p))
      );
    }
    function privateAdd(d, tweak) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      if (!isTweak(tweak)) {
        throw new Error(THROW_BAD_TWEAK);
      }
      return throwToNull(() => _privateAdd(d, tweak));
    }
    function privateSub(d, tweak) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      if (!isTweak(tweak)) {
        throw new Error(THROW_BAD_TWEAK);
      }
      return throwToNull(() => _privateSub(d, tweak));
    }
    function privateNegate(d) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      return _privateNegate(d);
    }
    function sign2(h2, d, e) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_SCALAR);
      }
      if (!isExtraData(e)) {
        throw new Error(THROW_BAD_EXTRA_DATA);
      }
      return secp256k1.secp256k1.sign(h2, d, { extraEntropy: e }).toCompactRawBytes();
    }
    function signRecoverable(h2, d, e) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_SCALAR);
      }
      if (!isExtraData(e)) {
        throw new Error(THROW_BAD_EXTRA_DATA);
      }
      const sig = secp256k1.secp256k1.sign(h2, d, { extraEntropy: e });
      return {
        signature: sig.toCompactRawBytes(),
        recoveryId: sig.recovery
      };
    }
    function signSchnorr(h2, d, e) {
      if (!isPrivate(d)) {
        throw new Error(THROW_BAD_PRIVATE);
      }
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_SCALAR);
      }
      if (!isExtraData(e)) {
        throw new Error(THROW_BAD_EXTRA_DATA);
      }
      return secp256k1.schnorr.sign(h2, d, e);
    }
    function recover(h2, signature, recoveryId, compressed) {
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_HASH);
      }
      if (!isSignature(signature) || !isSignatureNonzeroRS(signature)) {
        throw new Error(THROW_BAD_SIGNATURE);
      }
      if (recoveryId & 2) {
        if (!isSigrLessThanPMinusN(signature))
          throw new Error(THROW_BAD_RECOVERY_ID);
      }
      if (!isXOnlyPoint(signature.subarray(0, 32))) {
        throw new Error(THROW_BAD_SIGNATURE);
      }
      const s = secp256k1.secp256k1.Signature.fromCompact(signature).addRecoveryBit(recoveryId);
      const Q2 = s.recoverPublicKey(h2);
      if (!Q2) throw new Error(THROW_BAD_SIGNATURE);
      return Q2.toRawBytes(assumeCompression(compressed));
    }
    function verify(h2, Q2, signature, strict) {
      if (!isPoint(Q2)) {
        throw new Error(THROW_BAD_POINT);
      }
      if (!isSignature(signature)) {
        throw new Error(THROW_BAD_SIGNATURE);
      }
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_SCALAR);
      }
      return secp256k1.secp256k1.verify(signature, h2, Q2, { lowS: strict });
    }
    function verifySchnorr(h2, Q2, signature) {
      if (!isXOnlyPoint(Q2)) {
        throw new Error(THROW_BAD_POINT);
      }
      if (!isSignature(signature)) {
        throw new Error(THROW_BAD_SIGNATURE);
      }
      if (!isHash(h2)) {
        throw new Error(THROW_BAD_SCALAR);
      }
      return secp256k1.schnorr.verify(signature, h2, Q2);
    }
    exports2.isPoint = isPoint;
    exports2.isPointCompressed = isPointCompressed;
    exports2.isPrivate = isPrivate;
    exports2.isXOnlyPoint = isXOnlyPoint;
    exports2.pointAdd = pointAdd;
    exports2.pointAddScalar = pointAddScalar;
    exports2.pointCompress = pointCompress;
    exports2.pointFromScalar = pointFromScalar;
    exports2.pointMultiply = pointMultiply;
    exports2.privateAdd = privateAdd;
    exports2.privateNegate = privateNegate;
    exports2.privateSub = privateSub;
    exports2.recover = recover;
    exports2.sign = sign2;
    exports2.signRecoverable = signRecoverable;
    exports2.signSchnorr = signSchnorr;
    exports2.verify = verify;
    exports2.verifySchnorr = verifySchnorr;
    exports2.xOnlyPointAddTweak = xOnlyPointAddTweak;
    exports2.xOnlyPointFromPoint = xOnlyPointFromPoint;
    exports2.xOnlyPointFromScalar = xOnlyPointFromScalar;
  }
});

// coins/xna.js
var require_xna = __commonJS({
  "coins/xna.js"(exports2, module2) {
    var xna2 = {
      mainnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 1e8,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "94C49B3B-2C88-4408-B566-3D277C596778",
        network: "mainnet",
        hashGenesisBlock: "00000044d33c0c0ba019be5c0249730424a69cb4c222153322f68c6104484806",
        port: 19e3,
        portRpc: 19001,
        protocol: {
          magic: 1381320014
        },
        seedsDns: [
          "seed1.neurai.org",
          "seed2.neurai.org",
          "neurai-ipv4.neuraiexplorer.com"
        ],
        versions: {
          bip32: {
            private: 76066276,
            public: 76067358
          },
          bip44: 1900,
          private: 128,
          public: 53,
          scripthash: 117
        }
      },
      testnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 1e8,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "1EB2ACBA-E8E0-4970-BB20-37DA4B70F6A6",
        network: "testnet",
        hashGenesisBlock: "0000006af8b8297448605b0283473ec712f9768f81cc7eae6269b875dee3b0cf",
        port: 19100,
        portRpc: 19101,
        protocol: {
          magic: 1313166674
        },
        seedsDns: [
          "testnet1.neuracrypt.org",
          "testnet2.neuracrypt.org",
          "testnet3.neuracrypt.org"
        ],
        versions: {
          bip32: {
            private: 70615956,
            public: 70617039
          },
          bip44: 1,
          private: 239,
          public: 127,
          scripthash: 196
        }
      }
    };
    var chains = {
      xna: xna2
    };
    module2.exports = {
      xna: xna2,
      chains
    };
  }
});

// coins/xna-legacy.js
var require_xna_legacy = __commonJS({
  "coins/xna-legacy.js"(exports2, module2) {
    var xnaLegacy2 = {
      mainnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 1e8,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "94C49B3B-2C88-4408-B566-3D277C596778",
        network: "mainnet",
        hashGenesisBlock: "00000044d33c0c0ba019be5c0249730424a69cb4c222153322f68c6104484806",
        port: 19e3,
        portRpc: 19001,
        protocol: {
          magic: 1381320014
        },
        seedsDns: [
          "seed1.neurai.org",
          "seed2.neurai.org",
          "neurai-ipv4.neuraiexplorer.com"
        ],
        versions: {
          bip32: {
            private: 76066276,
            public: 76067358
          },
          bip44: 0,
          private: 128,
          public: 53,
          scripthash: 117
        }
      },
      testnet: {
        name: "Neurai",
        unit: "XNA",
        symbol: "xna",
        decimalPlaces: 1e8,
        messagePrefix: "Neurai Signed Message:\n",
        confirmations: 6,
        website: "https://neurai.org/",
        projectUrl: "https://github.com/NeuraiProject",
        id: "1EB2ACBA-E8E0-4970-BB20-37DA4B70F6A6",
        network: "testnet",
        hashGenesisBlock: "0000006af8b8297448605b0283473ec712f9768f81cc7eae6269b875dee3b0cf",
        port: 19100,
        portRpc: 19101,
        protocol: {
          magic: 1313166674
        },
        seedsDns: [
          "testnet1.neuracrypt.org",
          "testnet2.neuracrypt.org",
          "testnet3.neuracrypt.org"
        ],
        versions: {
          bip32: {
            private: 70615956,
            public: 70617039
          },
          bip44: 1,
          private: 239,
          public: 127,
          scripthash: 196
        }
      }
    };
    var chains = {
      "xna-legacy": xnaLegacy2
    };
    module2.exports = {
      xnaLegacy: xnaLegacy2,
      chains
    };
  }
});

// coins/xna-pq.js
var require_xna_pq = __commonJS({
  "coins/xna-pq.js"(exports2, module2) {
    var xnaPQ2 = {
      mainnet: {
        hrp: "nq",
        witnessVersion: 1,
        purpose: 100,
        coinType: 1900,
        changeIndex: 0,
        bip32: {
          private: 76066276,
          public: 76067358
        }
      },
      testnet: {
        hrp: "tnq",
        witnessVersion: 1,
        purpose: 100,
        coinType: 1900,
        changeIndex: 1,
        bip32: {
          private: 70615956,
          public: 70617039
        }
      }
    };
    var pqChains = {
      "xna-pq": xnaPQ2.mainnet,
      "xna-pq-test": xnaPQ2.testnet
    };
    module2.exports = {
      xnaPQ: xnaPQ2,
      pqChains
    };
  }
});

// index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  sign: () => sign
});
module.exports = __toCommonJS(index_exports);
var bitcoin2 = __toESM(require_src2());

// node_modules/ecpair/src/esm/networks.js
var bitcoin = {
  messagePrefix: "Bitcoin Signed Message:\n",
  bech32: "bc",
  bip32: {
    public: 76067358,
    private: 76066276
  },
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128
};

// node_modules/valibot/dist/index.js
var store;
function getGlobalConfig(config2) {
  return {
    lang: config2?.lang ?? store?.lang,
    message: config2?.message,
    abortEarly: config2?.abortEarly ?? store?.abortEarly,
    abortPipeEarly: config2?.abortPipeEarly ?? store?.abortPipeEarly
  };
}
var store2;
function getGlobalMessage(lang) {
  return store2?.get(lang);
}
var store3;
function getSchemaMessage(lang) {
  return store3?.get(lang);
}
var store4;
function getSpecificMessage(reference, lang) {
  return store4?.get(reference)?.get(lang);
}
function _stringify(input) {
  const type = typeof input;
  if (type === "string") {
    return `"${input}"`;
  }
  if (type === "number" || type === "bigint" || type === "boolean") {
    return `${input}`;
  }
  if (type === "object" || type === "function") {
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  }
  return type;
}
function _addIssue(context, label, dataset, config2, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
    // @ts-expect-error
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config2.lang,
    abortEarly: config2.abortEarly,
    abortPipeEarly: config2.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message = other?.message ?? // @ts-expect-error
  context.message ?? getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? getSchemaMessage(issue.lang) : null) ?? config2.message ?? getGlobalMessage(issue.lang);
  if (message) {
    issue.message = typeof message === "function" ? message(issue) : message;
  }
  if (isSchema) {
    dataset.typed = false;
  }
  if (dataset.issues) {
    dataset.issues.push(issue);
  } else {
    dataset.issues = [issue];
  }
}
var ValiError = class extends Error {
  /**
   * The error issues.
   */
  issues;
  /**
   * Creates a Valibot error with useful information.
   *
   * @param issues The error issues.
   */
  constructor(issues) {
    super(issues[0].message);
    this.name = "ValiError";
    this.issues = issues;
  }
};
function integer(message) {
  return {
    kind: "validation",
    type: "integer",
    reference: integer,
    async: false,
    expects: null,
    requirement: Number.isInteger,
    message,
    _run(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, "integer", dataset, config2);
      }
      return dataset;
    }
  };
}
function length(requirement, message) {
  return {
    kind: "validation",
    type: "length",
    reference: length,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    _run(dataset, config2) {
      if (dataset.typed && dataset.value.length !== this.requirement) {
        _addIssue(this, "length", dataset, config2, {
          received: `${dataset.value.length}`
        });
      }
      return dataset;
    }
  };
}
function maxValue(requirement, message) {
  return {
    kind: "validation",
    type: "max_value",
    reference: maxValue,
    async: false,
    expects: `<=${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message,
    _run(dataset, config2) {
      if (dataset.typed && dataset.value > this.requirement) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}
function minValue(requirement, message) {
  return {
    kind: "validation",
    type: "min_value",
    reference: minValue,
    async: false,
    expects: `>=${requirement instanceof Date ? requirement.toJSON() : _stringify(requirement)}`,
    requirement,
    message,
    _run(dataset, config2) {
      if (dataset.typed && dataset.value < this.requirement) {
        _addIssue(this, "value", dataset, config2, {
          received: dataset.value instanceof Date ? dataset.value.toJSON() : _stringify(dataset.value)
        });
      }
      return dataset;
    }
  };
}
function transform(operation) {
  return {
    kind: "transformation",
    type: "transform",
    reference: transform,
    async: false,
    operation,
    _run(dataset) {
      dataset.value = this.operation(dataset.value);
      return dataset;
    }
  };
}
function getDefault(schema, dataset, config2) {
  return typeof schema.default === "function" ? (
    // @ts-expect-error
    schema.default(dataset, config2)
  ) : (
    // @ts-expect-error
    schema.default
  );
}
function boolean(message) {
  return {
    kind: "schema",
    type: "boolean",
    reference: boolean,
    expects: "boolean",
    async: false,
    message,
    _run(dataset, config2) {
      if (typeof dataset.value === "boolean") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}
function instance(class_, message) {
  return {
    kind: "schema",
    type: "instance",
    reference: instance,
    expects: class_.name,
    async: false,
    class: class_,
    message,
    _run(dataset, config2) {
      if (dataset.value instanceof this.class) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}
function number(message) {
  return {
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message,
    _run(dataset, config2) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value)) {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}
function object(entries, message) {
  return {
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries,
    message,
    _run(dataset, config2) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const value2 = input[key];
          const valueDataset = this.entries[key]._run(
            { typed: false, value: value2 },
            config2
          );
          if (valueDataset.issues) {
            const pathItem = {
              type: "object",
              origin: "value",
              input,
              key,
              value: value2
            };
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                issue.path = [pathItem];
              }
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              dataset.issues = valueDataset.issues;
            }
            if (config2.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!valueDataset.typed) {
            dataset.typed = false;
          }
          if (valueDataset.value !== void 0 || key in input) {
            dataset.value[key] = valueDataset.value;
          }
        }
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}
function optional(wrapped, ...args) {
  const schema = {
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `${wrapped.expects} | undefined`,
    async: false,
    wrapped,
    _run(dataset, config2) {
      if (dataset.value === void 0) {
        if ("default" in this) {
          dataset.value = getDefault(
            this,
            dataset,
            config2
          );
        }
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped._run(dataset, config2);
    }
  };
  if (0 in args) {
    schema.default = args[0];
  }
  return schema;
}
function string(message) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message,
    _run(dataset, config2) {
      if (typeof dataset.value === "string") {
        dataset.typed = true;
      } else {
        _addIssue(this, "type", dataset, config2);
      }
      return dataset;
    }
  };
}
function _subIssues(datasets) {
  let issues;
  if (datasets) {
    for (const dataset of datasets) {
      if (issues) {
        issues.push(...dataset.issues);
      } else {
        issues = dataset.issues;
      }
    }
  }
  return issues;
}
function union(options, message) {
  return {
    kind: "schema",
    type: "union",
    reference: union,
    expects: [...new Set(options.map((option) => option.expects))].join(" | ") || "never",
    async: false,
    options,
    message,
    _run(dataset, config2) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema._run(
          { typed: false, value: dataset.value },
          config2
        );
        if (optionDataset.typed) {
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset);
            } else {
              typedDatasets = [optionDataset];
            }
          } else {
            validDataset = optionDataset;
            break;
          }
        } else {
          if (untypedDatasets) {
            untypedDatasets.push(optionDataset);
          } else {
            untypedDatasets = [optionDataset];
          }
        }
      }
      if (validDataset) {
        return validDataset;
      }
      if (typedDatasets) {
        if (typedDatasets.length === 1) {
          return typedDatasets[0];
        }
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(typedDatasets)
        });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) {
        return untypedDatasets[0];
      } else {
        _addIssue(this, "type", dataset, config2, {
          issues: _subIssues(untypedDatasets)
        });
      }
      return dataset;
    }
  };
}
function parse(schema, input, config2) {
  const dataset = schema._run(
    { typed: false, value: input },
    getGlobalConfig(config2)
  );
  if (dataset.issues) {
    throw new ValiError(dataset.issues);
  }
  return dataset.value;
}
function pipe(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    _run(dataset, config2) {
      for (const item of pipe2) {
        if (item.kind !== "metadata") {
          if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
            dataset.typed = false;
            break;
          }
          if (!dataset.issues || !config2.abortEarly && !config2.abortPipeEarly) {
            dataset = item._run(dataset, config2);
          }
        }
      }
      return dataset;
    }
  };
}

// node_modules/ecpair/src/esm/types.js
var Uint32Schema = pipe(
  number(),
  integer(),
  minValue(0),
  maxValue(4294967295)
);
var Uint8Schema = pipe(
  number(),
  integer(),
  minValue(0),
  maxValue(255)
);
var NetworkSchema = object({
  messagePrefix: union([string(), instance(Uint8Array)]),
  bech32: string(),
  bip32: object({
    public: Uint32Schema,
    private: Uint32Schema
  }),
  pubKeyHash: Uint8Schema,
  scriptHash: Uint8Schema,
  wif: Uint8Schema
});
var Buffer256Bit = pipe(instance(Uint8Array), length(32));

// node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance2) {
  abytes(out);
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
var Hash = class {
};
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h2 = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h2, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE2) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length2;
    to.pos = pos;
    if (length2 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D: D2, E, F: F2, G, H } = this;
    return [A, B, C, D2, E, F2, G, H];
  }
  // prettier-ignore
  set(A, B, C, D2, E, F2, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D2 | 0;
    this.E = E | 0;
    this.F = F2 | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D: D2, E, F: F2, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F2, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F2;
      F2 = E;
      E = D2 + T1 | 0;
      D2 = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D2 = D2 + this.D | 0;
    E = E + this.E | 0;
    F2 = F2 + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D2, E, F2, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());

// node_modules/@noble/hashes/esm/sha256.js
var sha2562 = sha256;

// node_modules/wif/node_modules/base-x/src/esm/index.js
function base(ALPHABET2) {
  if (ALPHABET2.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  const BASE_MAP = new Uint8Array(256);
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (let i = 0; i < ALPHABET2.length; i++) {
    const x = ALPHABET2.charAt(i);
    const xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  const BASE = ALPHABET2.length;
  const LEADER = ALPHABET2.charAt(0);
  const FACTOR = Math.log(BASE) / Math.log(256);
  const iFACTOR = Math.log(256) / Math.log(BASE);
  function encode2(source) {
    if (source instanceof Uint8Array) {
    } else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    let zeroes = 0;
    let length2 = 0;
    let pbegin = 0;
    const pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    const size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    const b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      let carry = source[pbegin];
      let i = 0;
      for (let it1 = size - 1; (carry !== 0 || i < length2) && it1 !== -1; it1--, i++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i;
      pbegin++;
    }
    let it2 = size - length2;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    let str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET2.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    let psz = 0;
    let zeroes = 0;
    let length2 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    const size = (source.length - psz) * FACTOR + 1 >>> 0;
    const b256 = new Uint8Array(size);
    while (psz < source.length) {
      const charCode = source.charCodeAt(psz);
      if (charCode > 255) {
        return;
      }
      let carry = BASE_MAP[charCode];
      if (carry === 255) {
        return;
      }
      let i = 0;
      for (let it3 = size - 1; (carry !== 0 || i < length2) && it3 !== -1; it3--, i++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i;
      psz++;
    }
    let it4 = size - length2;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    const vch = new Uint8Array(zeroes + (size - it4));
    let j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode2(string2) {
    const buffer = decodeUnsafe(string2);
    if (buffer) {
      return buffer;
    }
    throw new Error("Non-base" + BASE + " character");
  }
  return {
    encode: encode2,
    decodeUnsafe,
    decode: decode2
  };
}
var esm_default = base;

// node_modules/wif/node_modules/bs58/src/esm/index.js
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var esm_default2 = esm_default(ALPHABET);

// node_modules/wif/node_modules/bs58check/src/esm/base.js
function base_default(checksumFn) {
  function encode2(payload) {
    var payloadU8 = Uint8Array.from(payload);
    var checksum = checksumFn(payloadU8);
    var length2 = payloadU8.length + 4;
    var both = new Uint8Array(length2);
    both.set(payloadU8, 0);
    both.set(checksum.subarray(0, 4), payloadU8.length);
    return esm_default2.encode(both);
  }
  function decodeRaw2(buffer) {
    var payload = buffer.slice(0, -4);
    var checksum = buffer.slice(-4);
    var newChecksum = checksumFn(payload);
    if (checksum[0] ^ newChecksum[0] | checksum[1] ^ newChecksum[1] | checksum[2] ^ newChecksum[2] | checksum[3] ^ newChecksum[3])
      return;
    return payload;
  }
  function decodeUnsafe(str) {
    var buffer = esm_default2.decodeUnsafe(str);
    if (buffer == null)
      return;
    return decodeRaw2(buffer);
  }
  function decode2(str) {
    var buffer = esm_default2.decode(str);
    var payload = decodeRaw2(buffer);
    if (payload == null)
      throw new Error("Invalid checksum");
    return payload;
  }
  return {
    encode: encode2,
    decode: decode2,
    decodeUnsafe
  };
}

// node_modules/wif/node_modules/bs58check/src/esm/index.js
function sha256x2(buffer) {
  return sha2562(sha2562(buffer));
}
var esm_default3 = base_default(sha256x2);

// node_modules/wif/src/esm/index.js
function decodeRaw(buffer, version) {
  if (version !== void 0 && buffer[0] !== version)
    throw new Error("Invalid network version");
  if (buffer.length === 33) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33),
      compressed: false
    };
  }
  if (buffer.length !== 34)
    throw new Error("Invalid WIF length");
  if (buffer[33] !== 1)
    throw new Error("Invalid compression flag");
  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33),
    compressed: true
  };
}
function encodeRaw(version, privateKey, compressed) {
  if (privateKey.length !== 32)
    throw new TypeError("Invalid privateKey length");
  var result = new Uint8Array(compressed ? 34 : 33);
  var view = new DataView(result.buffer);
  view.setUint8(0, version);
  result.set(privateKey, 1);
  if (compressed) {
    result[33] = 1;
  }
  return result;
}
function decode(str, version) {
  return decodeRaw(esm_default3.decode(str), version);
}
function encode(wif) {
  return esm_default3.encode(encodeRaw(wif.version, wif.privateKey, wif.compressed));
}

// node_modules/ecpair/src/esm/testecc.js
var h = (hex) => Buffer.from(hex, "hex");
function testEcc(ecc2) {
  assert(
    ecc2.isPoint(
      h("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
    )
  );
  assert(
    !ecc2.isPoint(
      h("030000000000000000000000000000000000000000000000000000000000000005")
    )
  );
  assert(
    ecc2.isPrivate(
      h("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
    )
  );
  assert(
    ecc2.isPrivate(
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140")
    )
  );
  assert(
    !ecc2.isPrivate(
      h("0000000000000000000000000000000000000000000000000000000000000000")
    )
  );
  assert(
    !ecc2.isPrivate(
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141")
    )
  );
  assert(
    !ecc2.isPrivate(
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364142")
    )
  );
  assert(
    Buffer.from(
      ecc2.privateAdd(
        h("0000000000000000000000000000000000000000000000000000000000000001"),
        h("0000000000000000000000000000000000000000000000000000000000000000")
      )
    ).equals(
      h("0000000000000000000000000000000000000000000000000000000000000001")
    )
  );
  assert(
    ecc2.privateAdd(
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036413e"),
      h("0000000000000000000000000000000000000000000000000000000000000003")
    ) === null
  );
  assert(
    Buffer.from(
      ecc2.privateAdd(
        h("e211078564db65c3ce7704f08262b1f38f1ef412ad15b5ac2d76657a63b2c500"),
        h("b51fbb69051255d1becbd683de5848242a89c229348dd72896a87ada94ae8665")
      )
    ).equals(
      h("9730c2ee69edbb958d42db7460bafa18fef9d955325aec99044c81c8282b0a24")
    )
  );
  assert(
    Buffer.from(
      ecc2.privateNegate(
        h("0000000000000000000000000000000000000000000000000000000000000001")
      )
    ).equals(
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140")
    )
  );
  assert(
    Buffer.from(
      ecc2.privateNegate(
        h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036413e")
      )
    ).equals(
      h("0000000000000000000000000000000000000000000000000000000000000003")
    )
  );
  assert(
    Buffer.from(
      ecc2.privateNegate(
        h("b1121e4088a66a28f5b6b0f5844943ecd9f610196d7bb83b25214b60452c09af")
      )
    ).equals(
      h("4eede1bf775995d70a494f0a7bb6bc11e0b8cccd41cce8009ab1132c8b0a3792")
    )
  );
  assert(
    Buffer.from(
      ecc2.pointCompress(
        h(
          "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
        ),
        true
      )
    ).equals(
      h("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
    )
  );
  assert(
    Buffer.from(
      ecc2.pointCompress(
        h(
          "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
        ),
        false
      )
    ).equals(
      h(
        "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
      )
    )
  );
  assert(
    Buffer.from(
      ecc2.pointCompress(
        h("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
        true
      )
    ).equals(
      h("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
    )
  );
  assert(
    Buffer.from(
      ecc2.pointCompress(
        h("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
        false
      )
    ).equals(
      h(
        "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
      )
    )
  );
  assert(
    Buffer.from(
      ecc2.pointFromScalar(
        h("b1121e4088a66a28f5b6b0f5844943ecd9f610196d7bb83b25214b60452c09af")
      )
    ).equals(
      h("02b07ba9dca9523b7ef4bd97703d43d20399eb698e194704791a25ce77a400df99")
    )
  );
  assert(
    ecc2.xOnlyPointAddTweak(
      h("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
      h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140")
    ) === null
  );
  let xOnlyRes = ecc2.xOnlyPointAddTweak(
    h("1617d38ed8d8657da4d4761e8057bc396ea9e4b9d29776d4be096016dbd2509b"),
    h("a8397a935f0dfceba6ba9618f6451ef4d80637abf4e6af2669fbc9de6a8fd2ac")
  );
  assert(
    Buffer.from(xOnlyRes.xOnlyPubkey).equals(
      h("e478f99dab91052ab39a33ea35fd5e6e4933f4d28023cd597c9a1f6760346adf")
    ) && xOnlyRes.parity === 1
  );
  xOnlyRes = ecc2.xOnlyPointAddTweak(
    h("2c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991"),
    h("823c3cd2142744b075a87eade7e1b8678ba308d566226a0056ca2b7a76f86b47")
  );
  assert(
    Buffer.from(xOnlyRes.xOnlyPubkey).equals(
      h("9534f8dc8c6deda2dc007655981c78b49c5d96c778fbf363462a11ec9dfd948c")
    ) && xOnlyRes.parity === 0
  );
  assert(
    Buffer.from(
      ecc2.sign(
        h("5e9f0a0d593efdcf78ac923bc3313e4e7d408d574354ee2b3288c0da9fbba6ed"),
        h("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140")
      )
    ).equals(
      h(
        "54c4a33c6423d689378f160a7ff8b61330444abb58fb470f96ea16d99d4a2fed07082304410efa6b2943111b6a4e0aaa7b7db55a07e9861d1fb3cb1f421044a5"
      )
    )
  );
  assert(
    ecc2.verify(
      h("5e9f0a0d593efdcf78ac923bc3313e4e7d408d574354ee2b3288c0da9fbba6ed"),
      h("0379be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
      h(
        "54c4a33c6423d689378f160a7ff8b61330444abb58fb470f96ea16d99d4a2fed07082304410efa6b2943111b6a4e0aaa7b7db55a07e9861d1fb3cb1f421044a5"
      )
    )
  );
  if (ecc2.signSchnorr) {
    assert(
      Buffer.from(
        ecc2.signSchnorr(
          h("7e2d58d8b3bcdf1abadec7829054f90dda9805aab56c77333024b9d0a508b75c"),
          h("c90fdaa22168c234c4c6628b80dc1cd129024e088a67cc74020bbea63b14e5c9"),
          h("c87aa53824b4d7ae2eb035a2b5bbbccc080e76cdc6d1692c4b0b62d798e6d906")
        )
      ).equals(
        h(
          "5831aaeed7b44bb74e5eab94ba9d4294c49bcf2a60728d8b4c200f50dd313c1bab745879a5ad954a72c45a91c3a51d3c7adea98d82f8481e0e1e03674a6f3fb7"
        )
      )
    );
  }
  if (ecc2.verifySchnorr) {
    assert(
      ecc2.verifySchnorr(
        h("7e2d58d8b3bcdf1abadec7829054f90dda9805aab56c77333024b9d0a508b75c"),
        h("dd308afec5777e13121fa72b9cc1b7cc0139715309b086c960e18fd969774eb8"),
        h(
          "5831aaeed7b44bb74e5eab94ba9d4294c49bcf2a60728d8b4c200f50dd313c1bab745879a5ad954a72c45a91c3a51d3c7adea98d82f8481e0e1e03674a6f3fb7"
        )
      )
    );
  }
}
function assert(bool) {
  if (!bool) throw new Error("ecc library invalid");
}

// node_modules/uint8array-tools/src/mjs/index.js
function concat(arrays) {
  return Uint8Array.from(Buffer.concat(arrays));
}
function writeUInt32(buffer, offset, value, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  const buf = Buffer.alloc(4);
  if (littleEndian === "LE") {
    buf.writeUInt32LE(value, 0);
  } else {
    buf.writeUInt32BE(value, 0);
  }
  buffer.set(Uint8Array.from(buf), offset);
}

// node_modules/ecpair/src/esm/ecpair.js
var ECPairOptionsSchema = optional(
  object({
    compressed: optional(boolean()),
    network: optional(NetworkSchema),
    // https://github.com/fabian-hiller/valibot/issues/243#issuecomment-2182514063
    rng: optional(
      pipe(
        instance(Function),
        transform((func) => {
          return (arg) => {
            const parsedArg = parse(optional(number()), arg);
            const returnedValue = func(parsedArg);
            const parsedReturn = parse(instance(Uint8Array), returnedValue);
            return parsedReturn;
          };
        })
      )
    )
  })
);
var toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33);
function ECPairFactory(ecc2) {
  testEcc(ecc2);
  function isPoint(maybePoint) {
    return ecc2.isPoint(maybePoint);
  }
  function fromPrivateKey(buffer, options) {
    parse(Buffer256Bit, buffer);
    if (!ecc2.isPrivate(buffer))
      throw new TypeError("Private key not in range [1, n)");
    parse(ECPairOptionsSchema, options);
    return new ECPair2(buffer, void 0, options);
  }
  function fromPublicKey(buffer, options) {
    if (!ecc2.isPoint(buffer)) {
      throw new Error("Point not on the curve");
    }
    parse(ECPairOptionsSchema, options);
    return new ECPair2(void 0, buffer, options);
  }
  function fromWIF(wifString, network) {
    const decoded = decode(wifString);
    const version = decoded.version;
    if (Array.isArray(network)) {
      network = network.filter((x) => {
        return version === x.wif;
      }).pop();
      if (!network) throw new Error("Unknown network version");
    } else {
      network = network || bitcoin;
      if (version !== network.wif) throw new Error("Invalid network version");
    }
    return fromPrivateKey(decoded.privateKey, {
      compressed: decoded.compressed,
      network
    });
  }
  function makeRandom(options) {
    parse(ECPairOptionsSchema, options);
    if (options === void 0) options = {};
    const rng = options.rng || ((size) => crypto.getRandomValues(new Uint8Array(size)));
    let d;
    do {
      d = rng(32);
      parse(Buffer256Bit, d);
    } while (!ecc2.isPrivate(d));
    return fromPrivateKey(d, options);
  }
  class ECPair2 {
    __D;
    __Q;
    compressed;
    network;
    lowR;
    constructor(__D, __Q, options) {
      this.__D = __D;
      this.__Q = __Q;
      this.lowR = false;
      if (options === void 0) options = {};
      this.compressed = options.compressed === void 0 ? true : options.compressed;
      this.network = options.network || bitcoin;
      if (__Q !== void 0) this.__Q = ecc2.pointCompress(__Q, this.compressed);
    }
    get privateKey() {
      return this.__D;
    }
    get publicKey() {
      if (!this.__Q) {
        const p = ecc2.pointFromScalar(this.__D, this.compressed);
        this.__Q = p;
      }
      return this.__Q;
    }
    toWIF() {
      if (!this.__D) throw new Error("Missing private key");
      return encode({
        compressed: this.compressed,
        privateKey: this.__D,
        version: this.network.wif
      });
    }
    tweak(t) {
      if (this.privateKey) return this.tweakFromPrivateKey(t);
      return this.tweakFromPublicKey(t);
    }
    sign(hash, lowR) {
      if (!this.__D) throw new Error("Missing private key");
      if (lowR === void 0) lowR = this.lowR;
      if (lowR === false) {
        return ecc2.sign(hash, this.__D);
      } else {
        let sig = ecc2.sign(hash, this.__D);
        const extraData = new Uint8Array(32);
        let counter = 0;
        while (sig[0] > 127) {
          counter++;
          writeUInt32(extraData, 0, counter, "LE");
          sig = ecc2.sign(hash, this.__D, extraData);
        }
        return sig;
      }
    }
    signSchnorr(hash) {
      if (!this.privateKey) throw new Error("Missing private key");
      if (!ecc2.signSchnorr)
        throw new Error("signSchnorr not supported by ecc library");
      return ecc2.signSchnorr(hash, this.privateKey);
    }
    verify(hash, signature) {
      return ecc2.verify(hash, this.publicKey, signature);
    }
    verifySchnorr(hash, signature) {
      if (!ecc2.verifySchnorr)
        throw new Error("verifySchnorr not supported by ecc library");
      return ecc2.verifySchnorr(hash, this.publicKey.subarray(1, 33), signature);
    }
    tweakFromPublicKey(t) {
      const xOnlyPubKey = toXOnly(this.publicKey);
      const tweakedPublicKey = ecc2.xOnlyPointAddTweak(xOnlyPubKey, t);
      if (!tweakedPublicKey || tweakedPublicKey.xOnlyPubkey === null)
        throw new Error("Cannot tweak public key!");
      const parityByte = Uint8Array.from([
        tweakedPublicKey.parity === 0 ? 2 : 3
      ]);
      return fromPublicKey(
        concat([parityByte, tweakedPublicKey.xOnlyPubkey]),
        {
          network: this.network,
          compressed: this.compressed
        }
      );
    }
    tweakFromPrivateKey(t) {
      const hasOddY = this.publicKey[0] === 3 || this.publicKey[0] === 4 && (this.publicKey[64] & 1) === 1;
      const privateKey = hasOddY ? ecc2.privateNegate(this.privateKey) : this.privateKey;
      const tweakedPrivateKey = ecc2.privateAdd(privateKey, t);
      if (!tweakedPrivateKey) throw new Error("Invalid tweaked private key!");
      return fromPrivateKey(tweakedPrivateKey, {
        network: this.network,
        compressed: this.compressed
      });
    }
  }
  return {
    isPoint,
    fromPrivateKey,
    fromPublicKey,
    fromWIF,
    makeRandom
  };
}

// index.ts
var ecc = __toESM(require_dist2());

// node_modules/@noble/post-quantum/node_modules/@noble/hashes/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes2(value, length2, title = "") {
  const bytes = isBytes2(value);
  const len = value?.length;
  const needsLen = length2 !== void 0;
  if (!bytes || needsLen && len !== length2) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length2}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function aexists2(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance2) {
  abytes2(out, void 0, "digestInto() output");
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher2(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/post-quantum/node_modules/@noble/curves/utils.js
function abool(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}

// node_modules/@noble/post-quantum/node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h: h2, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h2, l];
  }
  return [Ah, Al];
}
var rotlSH = (h2, l, s) => h2 << s | l >>> 32 - s;
var rotlSL = (h2, l, s) => l << s | h2 >>> 32 - s;
var rotlBH = (h2, l, s) => l << s - 32 | h2 >>> 64 - s;
var rotlBL = (h2, l, s) => h2 << s - 32 | l >>> 64 - s;

// node_modules/@noble/post-quantum/node_modules/@noble/hashes/sha3.js
var _0n = BigInt(0);
var _1n = BigInt(1);
var _2n = BigInt(2);
var _7n = BigInt(7);
var _256n = BigInt(256);
var _0x71n = BigInt(113);
var SHA3_PI = [];
var SHA3_ROTL = [];
var _SHA3_IOTA = [];
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI.push(2 * (5 * y + x));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n;
  for (let j = 0; j < 7; j++) {
    R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
    if (R & _2n)
      t ^= _1n << (_1n << BigInt(j)) - _1n;
  }
  _SHA3_IOTA.push(t);
}
var IOTAS = split(_SHA3_IOTA, true);
var SHA3_IOTA_H = IOTAS[0];
var SHA3_IOTA_L = IOTAS[1];
var rotlH = (h2, l, s) => s > 32 ? rotlBH(h2, l, s) : rotlSH(h2, l, s);
var rotlL = (h2, l, s) => s > 32 ? rotlBL(h2, l, s) : rotlSL(h2, l, s);
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean2(B);
}
var Keccak = class _Keccak {
  state;
  pos = 0;
  posOut = 0;
  finished = false;
  state32;
  destroyed = false;
  blockLen;
  suffix;
  outputLen;
  enableXOF = false;
  rounds;
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    anumber(outputLen, "outputLen");
    if (!(0 < blockLen && blockLen < 200))
      throw new Error("only keccak-f1600 function is supported");
    this.state = new Uint8Array(200);
    this.state32 = u32(this.state);
  }
  clone() {
    return this._cloneInto();
  }
  keccak() {
    swap32IfBE(this.state32);
    keccakP(this.state32, this.rounds);
    swap32IfBE(this.state32);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    aexists2(this);
    abytes2(data);
    const { blockLen, state } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i = 0; i < take; i++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    aexists2(this, false);
    abytes2(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes) {
    anumber(bytes);
    return this.xofInto(new Uint8Array(bytes));
  }
  digestInto(out) {
    aoutput2(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    clean2(this.state);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to ||= new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds);
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
};
var genShake = (suffix, blockLen, outputLen, info = {}) => createHasher2((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true), info);
var shake128 = /* @__PURE__ */ genShake(31, 168, 16, /* @__PURE__ */ oidNist(11));
var shake256 = /* @__PURE__ */ genShake(31, 136, 32, /* @__PURE__ */ oidNist(12));

// node_modules/@noble/post-quantum/node_modules/@noble/curves/abstract/fft.js
function checkU32(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 4294967295)
    throw new Error("wrong u32 integer:" + n);
  return n;
}
function isPowerOfTwo(x) {
  checkU32(x);
  return (x & x - 1) === 0 && x !== 0;
}
function reverseBits(n, bits) {
  checkU32(n);
  let reversed = 0;
  for (let i = 0; i < bits; i++, n >>>= 1)
    reversed = reversed << 1 | n & 1;
  return reversed;
}
function log2(n) {
  checkU32(n);
  return 31 - Math.clz32(n);
}
function bitReversalInplace(values) {
  const n = values.length;
  if (n < 2 || !isPowerOfTwo(n))
    throw new Error("n must be a power of 2 and greater than 1. Got " + n);
  const bits = log2(n);
  for (let i = 0; i < n; i++) {
    const j = reverseBits(i, bits);
    if (i < j) {
      const tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }
  }
  return values;
}
var FFTCore = (F2, coreOpts) => {
  const { N: N2, roots, dit, invertButterflies = false, skipStages = 0, brp = true } = coreOpts;
  const bits = log2(N2);
  if (!isPowerOfTwo(N2))
    throw new Error("FFT: Polynomial size should be power of two");
  const isDit = dit !== invertButterflies;
  isDit;
  return (values) => {
    if (values.length !== N2)
      throw new Error("FFT: wrong Polynomial length");
    if (dit && brp)
      bitReversalInplace(values);
    for (let i = 0, g = 1; i < bits - skipStages; i++) {
      const s = dit ? i + 1 + skipStages : bits - i;
      const m = 1 << s;
      const m2 = m >> 1;
      const stride = N2 >> s;
      for (let k = 0; k < N2; k += m) {
        for (let j = 0, grp = g++; j < m2; j++) {
          const rootPos = invertButterflies ? dit ? N2 - grp : grp : j * stride;
          const i0 = k + j;
          const i1 = k + j + m2;
          const omega = roots[rootPos];
          const b = values[i1];
          const a = values[i0];
          if (isDit) {
            const t = F2.mul(b, omega);
            values[i0] = F2.add(a, t);
            values[i1] = F2.sub(a, t);
          } else if (invertButterflies) {
            values[i0] = F2.add(b, a);
            values[i1] = F2.mul(F2.sub(b, a), omega);
          } else {
            values[i0] = F2.add(a, b);
            values[i1] = F2.mul(F2.sub(a, b), omega);
          }
        }
      }
    }
    if (!dit && brp)
      bitReversalInplace(values);
    return values;
  };
};

// node_modules/@noble/post-quantum/utils.js
var abytesDoc = abytes2;
var randomBytes2 = randomBytes;
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function validateOpts(opts) {
  if (Object.prototype.toString.call(opts) !== "[object Object]")
    throw new TypeError("expected valid options object");
}
function validateVerOpts(opts) {
  validateOpts(opts);
  if (opts.context !== void 0)
    abytes2(opts.context, void 0, "opts.context");
}
function validateSigOpts(opts) {
  validateVerOpts(opts);
  if (opts.extraEntropy !== false && opts.extraEntropy !== void 0)
    abytes2(opts.extraEntropy, void 0, "opts.extraEntropy");
}
function splitCoder(label, ...lengths) {
  const getLength = (c) => typeof c === "number" ? c : c.bytesLen;
  const bytesLen = lengths.reduce((sum, a) => sum + getLength(a), 0);
  return {
    bytesLen,
    encode: (bufs) => {
      const res = new Uint8Array(bytesLen);
      for (let i = 0, pos = 0; i < lengths.length; i++) {
        const c = lengths[i];
        const l = getLength(c);
        const b = typeof c === "number" ? bufs[i] : c.encode(bufs[i]);
        abytes2(b, l, label);
        res.set(b, pos);
        if (typeof c !== "number")
          b.fill(0);
        pos += l;
      }
      return res;
    },
    decode: (buf) => {
      abytes2(buf, bytesLen, label);
      const res = [];
      for (const c of lengths) {
        const l = getLength(c);
        const b = buf.subarray(0, l);
        res.push(typeof c === "number" ? b : c.decode(b));
        buf = buf.subarray(l);
      }
      return res;
    }
  };
}
function vecCoder(c, vecLen) {
  const bytesLen = vecLen * c.bytesLen;
  return {
    bytesLen,
    encode: (u) => {
      if (u.length !== vecLen)
        throw new RangeError(`vecCoder.encode: wrong length=${u.length}. Expected: ${vecLen}`);
      const res = new Uint8Array(bytesLen);
      for (let i = 0, pos = 0; i < u.length; i++) {
        const b = c.encode(u[i]);
        res.set(b, pos);
        b.fill(0);
        pos += b.length;
      }
      return res;
    },
    decode: (a) => {
      abytes2(a, bytesLen);
      const r = [];
      for (let i = 0; i < a.length; i += c.bytesLen)
        r.push(c.decode(a.subarray(i, i + c.bytesLen)));
      return r;
    }
  };
}
function cleanBytes(...list) {
  for (const t of list) {
    if (Array.isArray(t))
      for (const b of t)
        b.fill(0);
    else
      t.fill(0);
  }
}
function getMask(bits) {
  if (!Number.isSafeInteger(bits) || bits < 0 || bits > 32)
    throw new RangeError(`expected bits in [0..32], got ${bits}`);
  return bits === 32 ? 4294967295 : ~(-1 << bits) >>> 0;
}
var EMPTY = /* @__PURE__ */ Uint8Array.of();
function getMessage(msg, ctx = EMPTY) {
  abytes2(msg);
  abytes2(ctx);
  if (ctx.length > 255)
    throw new RangeError("context should be 255 bytes or less");
  return concatBytes(new Uint8Array([0, ctx.length]), ctx, msg);
}
var oidNistP = /* @__PURE__ */ Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2]);
function checkHash(hash, requiredStrength = 0) {
  if (!hash.oid || !equalBytes(hash.oid.subarray(0, 10), oidNistP))
    throw new Error("hash.oid is invalid: expected NIST hash");
  const collisionResistance = hash.outputLen * 8 / 2;
  if (requiredStrength > collisionResistance) {
    throw new Error("Pre-hash security strength too low: " + collisionResistance + ", required: " + requiredStrength);
  }
}
function getMessagePrehash(hash, msg, ctx = EMPTY) {
  abytes2(msg);
  abytes2(ctx);
  if (ctx.length > 255)
    throw new RangeError("context should be 255 bytes or less");
  const hashed = hash(msg);
  return concatBytes(new Uint8Array([1, ctx.length]), ctx, hash.oid, hashed);
}

// node_modules/@noble/post-quantum/_crystals.js
var genCrystals = (opts) => {
  const { newPoly: newPoly2, N: N2, Q: Q2, F: F2, ROOT_OF_UNITY: ROOT_OF_UNITY2, brvBits, isKyber } = opts;
  const mod = (a, modulo = Q2) => {
    const result = a % modulo | 0;
    return (result >= 0 ? result | 0 : modulo + result | 0) | 0;
  };
  const smod = (a, modulo = Q2) => {
    const r = mod(a, modulo) | 0;
    return (r > modulo >> 1 ? r - modulo | 0 : r) | 0;
  };
  function getZettas() {
    const out = newPoly2(N2);
    for (let i = 0; i < N2; i++) {
      const b = reverseBits(i, brvBits);
      const p = BigInt(ROOT_OF_UNITY2) ** BigInt(b) % BigInt(Q2);
      out[i] = Number(p) | 0;
    }
    return out;
  }
  const nttZetas = getZettas();
  const field = {
    add: (a, b) => mod((a | 0) + (b | 0)) | 0,
    sub: (a, b) => mod((a | 0) - (b | 0)) | 0,
    mul: (a, b) => mod((a | 0) * (b | 0)) | 0,
    inv: (_a) => {
      throw new Error("not implemented");
    }
  };
  const nttOpts = {
    N: N2,
    roots: nttZetas,
    invertButterflies: true,
    skipStages: isKyber ? 1 : 0,
    brp: false
  };
  const dif = FFTCore(field, { dit: false, ...nttOpts });
  const dit = FFTCore(field, { dit: true, ...nttOpts });
  const NTT = {
    encode: (r) => {
      return dif(r);
    },
    decode: (r) => {
      dit(r);
      for (let i = 0; i < r.length; i++)
        r[i] = mod(F2 * r[i]);
      return r;
    }
  };
  const bitsCoder = (d, c) => {
    const mask = getMask(d);
    const bytesLen = d * (N2 / 8);
    return {
      bytesLen,
      encode: (poly) => {
        const r = new Uint8Array(bytesLen);
        for (let i = 0, buf = 0, bufLen = 0, pos = 0; i < poly.length; i++) {
          buf |= (c.encode(poly[i]) & mask) << bufLen;
          bufLen += d;
          for (; bufLen >= 8; bufLen -= 8, buf >>= 8)
            r[pos++] = buf & getMask(bufLen);
        }
        return r;
      },
      decode: (bytes) => {
        const r = newPoly2(N2);
        for (let i = 0, buf = 0, bufLen = 0, pos = 0; i < bytes.length; i++) {
          buf |= bytes[i] << bufLen;
          bufLen += 8;
          for (; bufLen >= d; bufLen -= d, buf >>= d)
            r[pos++] = c.decode(buf & mask);
        }
        return r;
      }
    };
  };
  return { mod, smod, nttZetas, NTT, bitsCoder };
};
var createXofShake = (shake) => (seed, blockLen) => {
  if (!blockLen)
    blockLen = shake.blockLen;
  const _seed = new Uint8Array(seed.length + 2);
  _seed.set(seed);
  const seedLen = seed.length;
  const buf = new Uint8Array(blockLen);
  let h2 = shake.create({});
  let calls = 0;
  let xofs = 0;
  return {
    stats: () => ({ calls, xofs }),
    get: (x, y) => {
      _seed[seedLen + 0] = x;
      _seed[seedLen + 1] = y;
      h2.destroy();
      h2 = shake.create({}).update(_seed);
      calls++;
      return () => {
        xofs++;
        return h2.xofInto(buf);
      };
    },
    clean: () => {
      h2.destroy();
      cleanBytes(buf, _seed);
    }
  };
};
var XOF128 = /* @__PURE__ */ createXofShake(shake128);
var XOF256 = /* @__PURE__ */ createXofShake(shake256);

// node_modules/@noble/post-quantum/ml-dsa.js
function validateInternalOpts(opts) {
  validateOpts(opts);
  if (opts.externalMu !== void 0)
    abool(opts.externalMu, "opts.externalMu");
}
var N = 256;
var Q = 8380417;
var ROOT_OF_UNITY = 1753;
var F = 8347681;
var D = 13;
var GAMMA2_1 = Math.floor((Q - 1) / 88) | 0;
var GAMMA2_2 = Math.floor((Q - 1) / 32) | 0;
var PARAMS = /* @__PURE__ */ (() => ({
  2: { K: 4, L: 4, D, GAMMA1: 2 ** 17, GAMMA2: GAMMA2_1, TAU: 39, ETA: 2, OMEGA: 80 },
  3: { K: 6, L: 5, D, GAMMA1: 2 ** 19, GAMMA2: GAMMA2_2, TAU: 49, ETA: 4, OMEGA: 55 },
  5: { K: 8, L: 7, D, GAMMA1: 2 ** 19, GAMMA2: GAMMA2_2, TAU: 60, ETA: 2, OMEGA: 75 }
}))();
var newPoly = (n) => new Int32Array(n);
var crystals = /* @__PURE__ */ genCrystals({
  N,
  Q,
  F,
  ROOT_OF_UNITY,
  newPoly,
  isKyber: false,
  brvBits: 8
});
var id = (n) => n;
var polyCoder = (d, compress = id, verify = id) => crystals.bitsCoder(d, {
  encode: (i) => compress(verify(i)),
  decode: (i) => verify(compress(i))
});
var polyAdd = (a, b) => {
  for (let i = 0; i < a.length; i++)
    a[i] = crystals.mod(a[i] + b[i]);
  return a;
};
var polySub = (a, b) => {
  for (let i = 0; i < a.length; i++)
    a[i] = crystals.mod(a[i] - b[i]);
  return a;
};
var polyShiftl = (p) => {
  for (let i = 0; i < N; i++)
    p[i] <<= D;
  return p;
};
var polyChknorm = (p, B) => {
  for (let i = 0; i < N; i++)
    if (Math.abs(crystals.smod(p[i])) >= B)
      return true;
  return false;
};
var MultiplyNTTs = (a, b) => {
  const c = newPoly(N);
  for (let i = 0; i < a.length; i++)
    c[i] = crystals.mod(a[i] * b[i]);
  return c;
};
function RejNTTPoly(xof) {
  const r = newPoly(N);
  for (let j = 0; j < N; ) {
    const b = xof();
    if (b.length % 3)
      throw new Error("RejNTTPoly: unaligned block");
    for (let i = 0; j < N && i <= b.length - 3; i += 3) {
      const t = (b[i + 0] | b[i + 1] << 8 | b[i + 2] << 16) & 8388607;
      if (t < Q)
        r[j++] = t;
    }
  }
  return r;
}
function getDilithium(opts) {
  const { K, L, GAMMA1, GAMMA2, TAU, ETA, OMEGA } = opts;
  const { CRH_BYTES, TR_BYTES, C_TILDE_BYTES, XOF128: XOF1282, XOF256: XOF2562, securityLevel } = opts;
  if (![2, 4].includes(ETA))
    throw new Error("Wrong ETA");
  if (![1 << 17, 1 << 19].includes(GAMMA1))
    throw new Error("Wrong GAMMA1");
  if (![GAMMA2_1, GAMMA2_2].includes(GAMMA2))
    throw new Error("Wrong GAMMA2");
  const BETA = TAU * ETA;
  const decompose = (r) => {
    const rPlus = crystals.mod(r);
    const r0 = crystals.smod(rPlus, 2 * GAMMA2) | 0;
    if (rPlus - r0 === Q - 1)
      return { r1: 0 | 0, r0: r0 - 1 | 0 };
    const r1 = Math.floor((rPlus - r0) / (2 * GAMMA2)) | 0;
    return { r1, r0 };
  };
  const HighBits = (r) => decompose(r).r1;
  const LowBits = (r) => decompose(r).r0;
  const MakeHint = (z, r) => {
    const res0 = z <= GAMMA2 || z > Q - GAMMA2 || z === Q - GAMMA2 && r === 0 ? 0 : 1;
    return res0;
  };
  const UseHint = (h2, r) => {
    const m = Math.floor((Q - 1) / (2 * GAMMA2));
    const { r1, r0 } = decompose(r);
    if (h2 === 1)
      return r0 > 0 ? crystals.mod(r1 + 1, m) | 0 : crystals.mod(r1 - 1, m) | 0;
    return r1 | 0;
  };
  const Power2Round = (r) => {
    const rPlus = crystals.mod(r);
    const r0 = crystals.smod(rPlus, 2 ** D) | 0;
    return { r1: Math.floor((rPlus - r0) / 2 ** D) | 0, r0 };
  };
  const hintCoder = {
    bytesLen: OMEGA + K,
    encode: (h2) => {
      if (h2 === false)
        throw new Error("hint.encode: hint is false");
      const res = new Uint8Array(OMEGA + K);
      for (let i = 0, k = 0; i < K; i++) {
        for (let j = 0; j < N; j++)
          if (h2[i][j] !== 0)
            res[k++] = j;
        res[OMEGA + i] = k;
      }
      return res;
    },
    decode: (buf) => {
      const h2 = [];
      let k = 0;
      for (let i = 0; i < K; i++) {
        const hi = newPoly(N);
        if (buf[OMEGA + i] < k || buf[OMEGA + i] > OMEGA)
          return false;
        for (let j = k; j < buf[OMEGA + i]; j++) {
          if (j > k && buf[j] <= buf[j - 1])
            return false;
          hi[buf[j]] = 1;
        }
        k = buf[OMEGA + i];
        h2.push(hi);
      }
      for (let j = k; j < OMEGA; j++)
        if (buf[j] !== 0)
          return false;
      return h2;
    }
  };
  const ETACoder = polyCoder(ETA === 2 ? 3 : 4, (i) => ETA - i, (i) => {
    if (!(-ETA <= i && i <= ETA))
      throw new Error(`malformed key s1/s3 ${i} outside of ETA range [${-ETA}, ${ETA}]`);
    return i;
  });
  const T0Coder = polyCoder(13, (i) => (1 << D - 1) - i);
  const T1Coder = polyCoder(10);
  const ZCoder = polyCoder(GAMMA1 === 1 << 17 ? 18 : 20, (i) => crystals.smod(GAMMA1 - i));
  const W1Coder = polyCoder(GAMMA2 === GAMMA2_1 ? 6 : 4);
  const W1Vec = vecCoder(W1Coder, K);
  const publicCoder = splitCoder("publicKey", 32, vecCoder(T1Coder, K));
  const secretCoder = splitCoder("secretKey", 32, 32, TR_BYTES, vecCoder(ETACoder, L), vecCoder(ETACoder, K), vecCoder(T0Coder, K));
  const sigCoder = splitCoder("signature", C_TILDE_BYTES, vecCoder(ZCoder, L), hintCoder);
  const CoefFromHalfByte = ETA === 2 ? (n) => n < 15 ? 2 - n % 5 : false : (n) => n < 9 ? 4 - n : false;
  function RejBoundedPoly(xof) {
    const r = newPoly(N);
    for (let j = 0; j < N; ) {
      const b = xof();
      for (let i = 0; j < N && i < b.length; i += 1) {
        const d1 = CoefFromHalfByte(b[i] & 15);
        const d2 = CoefFromHalfByte(b[i] >> 4 & 15);
        if (d1 !== false)
          r[j++] = d1;
        if (j < N && d2 !== false)
          r[j++] = d2;
      }
    }
    return r;
  }
  const SampleInBall = (seed) => {
    const pre = newPoly(N);
    const s = shake256.create({}).update(seed);
    const buf = new Uint8Array(shake256.blockLen);
    s.xofInto(buf);
    const masks = buf.slice(0, 8);
    for (let i = N - TAU, pos = 8, maskPos = 0, maskBit = 0; i < N; i++) {
      let b = i + 1;
      for (; b > i; ) {
        b = buf[pos++];
        if (pos < shake256.blockLen)
          continue;
        s.xofInto(buf);
        pos = 0;
      }
      pre[i] = pre[b];
      pre[b] = 1 - ((masks[maskPos] >> maskBit++ & 1) << 1);
      if (maskBit >= 8) {
        maskPos++;
        maskBit = 0;
      }
    }
    return pre;
  };
  const polyPowerRound = (p) => {
    const res0 = newPoly(N);
    const res1 = newPoly(N);
    for (let i = 0; i < p.length; i++) {
      const { r0, r1 } = Power2Round(p[i]);
      res0[i] = r0;
      res1[i] = r1;
    }
    return { r0: res0, r1: res1 };
  };
  const polyUseHint = (u, h2) => {
    for (let i = 0; i < N; i++)
      u[i] = UseHint(h2[i], u[i]);
    return u;
  };
  const polyMakeHint = (a, b) => {
    const v = newPoly(N);
    let cnt = 0;
    for (let i = 0; i < N; i++) {
      const h2 = MakeHint(a[i], b[i]);
      v[i] = h2;
      cnt += h2;
    }
    return { v, cnt };
  };
  const signRandBytes = 32;
  const seedCoder = splitCoder("seed", 32, 64, 32);
  const internal = {
    info: { type: "internal-ml-dsa" },
    lengths: {
      secretKey: secretCoder.bytesLen,
      publicKey: publicCoder.bytesLen,
      seed: 32,
      signature: sigCoder.bytesLen,
      signRand: signRandBytes
    },
    keygen: (seed) => {
      const seedDst = new Uint8Array(32 + 2);
      const randSeed = seed === void 0;
      if (randSeed)
        seed = randomBytes2(32);
      abytesDoc(seed, 32, "seed");
      seedDst.set(seed);
      if (randSeed)
        cleanBytes(seed);
      seedDst[32] = K;
      seedDst[33] = L;
      const [rho, rhoPrime, K_] = seedCoder.decode(shake256(seedDst, { dkLen: seedCoder.bytesLen }));
      const xofPrime = XOF2562(rhoPrime);
      const s1 = [];
      for (let i = 0; i < L; i++)
        s1.push(RejBoundedPoly(xofPrime.get(i & 255, i >> 8 & 255)));
      const s2 = [];
      for (let i = L; i < L + K; i++)
        s2.push(RejBoundedPoly(xofPrime.get(i & 255, i >> 8 & 255)));
      const s1Hat = s1.map((i) => crystals.NTT.encode(i.slice()));
      const t0 = [];
      const t1 = [];
      const xof = XOF1282(rho);
      const t = newPoly(N);
      for (let i = 0; i < K; i++) {
        cleanBytes(t);
        for (let j = 0; j < L; j++) {
          const aij = RejNTTPoly(xof.get(j, i));
          polyAdd(t, MultiplyNTTs(aij, s1Hat[j]));
        }
        crystals.NTT.decode(t);
        const { r0, r1 } = polyPowerRound(polyAdd(t, s2[i]));
        t0.push(r0);
        t1.push(r1);
      }
      const publicKey = publicCoder.encode([rho, t1]);
      const tr = shake256(publicKey, { dkLen: TR_BYTES });
      const secretKey = secretCoder.encode([rho, K_, tr, s1, s2, t0]);
      xof.clean();
      xofPrime.clean();
      cleanBytes(rho, rhoPrime, K_, s1, s2, s1Hat, t, t0, t1, tr, seedDst);
      return { publicKey, secretKey };
    },
    getPublicKey: (secretKey) => {
      const [rho, _K, _tr, s1, s2, _t0] = secretCoder.decode(secretKey);
      const xof = XOF1282(rho);
      const s1Hat = s1.map((p) => crystals.NTT.encode(p.slice()));
      const t1 = [];
      const tmp = newPoly(N);
      for (let i = 0; i < K; i++) {
        tmp.fill(0);
        for (let j = 0; j < L; j++) {
          const aij = RejNTTPoly(xof.get(j, i));
          polyAdd(tmp, MultiplyNTTs(aij, s1Hat[j]));
        }
        crystals.NTT.decode(tmp);
        polyAdd(tmp, s2[i]);
        const { r1 } = polyPowerRound(tmp);
        t1.push(r1);
      }
      xof.clean();
      cleanBytes(tmp, s1Hat, _t0, s1, s2);
      return publicCoder.encode([rho, t1]);
    },
    // NOTE: random is optional.
    sign: (msg, secretKey, opts2 = {}) => {
      validateSigOpts(opts2);
      validateInternalOpts(opts2);
      let { extraEntropy: random, externalMu = false } = opts2;
      const [rho, _K, tr, s1, s2, t0] = secretCoder.decode(secretKey);
      const A = [];
      const xof = XOF1282(rho);
      for (let i = 0; i < K; i++) {
        const pv = [];
        for (let j = 0; j < L; j++)
          pv.push(RejNTTPoly(xof.get(j, i)));
        A.push(pv);
      }
      xof.clean();
      for (let i = 0; i < L; i++)
        crystals.NTT.encode(s1[i]);
      for (let i = 0; i < K; i++) {
        crystals.NTT.encode(s2[i]);
        crystals.NTT.encode(t0[i]);
      }
      const mu = externalMu ? msg : (
        // 6: µ ← H(tr||M, 512)
        //    ▷ Compute message representative µ
        shake256.create({ dkLen: CRH_BYTES }).update(tr).update(msg).digest()
      );
      const rnd = random === false ? new Uint8Array(32) : random === void 0 ? randomBytes2(signRandBytes) : random;
      abytesDoc(rnd, 32, "extraEntropy");
      const rhoprime = shake256.create({ dkLen: CRH_BYTES }).update(_K).update(rnd).update(mu).digest();
      abytesDoc(rhoprime, CRH_BYTES);
      const x256 = XOF2562(rhoprime, ZCoder.bytesLen);
      main_loop: for (let kappa = 0; ; ) {
        const y = [];
        for (let i = 0; i < L; i++, kappa++)
          y.push(ZCoder.decode(x256.get(kappa & 255, kappa >> 8)()));
        const z = y.map((i) => crystals.NTT.encode(i.slice()));
        const w = [];
        for (let i = 0; i < K; i++) {
          const wi = newPoly(N);
          for (let j = 0; j < L; j++)
            polyAdd(wi, MultiplyNTTs(A[i][j], z[j]));
          crystals.NTT.decode(wi);
          w.push(wi);
        }
        const w1 = w.map((j) => j.map(HighBits));
        const cTilde = shake256.create({ dkLen: C_TILDE_BYTES }).update(mu).update(W1Vec.encode(w1)).digest();
        const cHat = crystals.NTT.encode(SampleInBall(cTilde));
        const cs1 = s1.map((i) => MultiplyNTTs(i, cHat));
        for (let i = 0; i < L; i++) {
          polyAdd(crystals.NTT.decode(cs1[i]), y[i]);
          if (polyChknorm(cs1[i], GAMMA1 - BETA))
            continue main_loop;
        }
        let cnt = 0;
        const h2 = [];
        for (let i = 0; i < K; i++) {
          const cs2 = crystals.NTT.decode(MultiplyNTTs(s2[i], cHat));
          const r0 = polySub(w[i], cs2).map(LowBits);
          if (polyChknorm(r0, GAMMA2 - BETA))
            continue main_loop;
          const ct0 = crystals.NTT.decode(MultiplyNTTs(t0[i], cHat));
          if (polyChknorm(ct0, GAMMA2))
            continue main_loop;
          polyAdd(r0, ct0);
          const hint = polyMakeHint(r0, w1[i]);
          h2.push(hint.v);
          cnt += hint.cnt;
        }
        if (cnt > OMEGA)
          continue;
        x256.clean();
        const res = sigCoder.encode([cTilde, cs1, h2]);
        cleanBytes(cTilde, cs1, h2, cHat, w1, w, z, y, rhoprime, s1, s2, t0, ...A);
        if (!externalMu)
          cleanBytes(mu);
        return res;
      }
      throw new Error("Unreachable code path reached, report this error");
    },
    verify: (sig, msg, publicKey, opts2 = {}) => {
      validateInternalOpts(opts2);
      const { externalMu = false } = opts2;
      const [rho, t1] = publicCoder.decode(publicKey);
      const tr = shake256(publicKey, { dkLen: TR_BYTES });
      if (sig.length !== sigCoder.bytesLen)
        return false;
      const [cTilde, z, h2] = sigCoder.decode(sig);
      if (h2 === false)
        return false;
      for (let i = 0; i < L; i++)
        if (polyChknorm(z[i], GAMMA1 - BETA))
          return false;
      const mu = externalMu ? msg : (
        // 7: µ ← H(tr||M, 512)
        shake256.create({ dkLen: CRH_BYTES }).update(tr).update(msg).digest()
      );
      const c = crystals.NTT.encode(SampleInBall(cTilde));
      const zNtt = z.map((i) => i.slice());
      for (let i = 0; i < L; i++)
        crystals.NTT.encode(zNtt[i]);
      const wTick1 = [];
      const xof = XOF1282(rho);
      for (let i = 0; i < K; i++) {
        const ct12d = MultiplyNTTs(crystals.NTT.encode(polyShiftl(t1[i])), c);
        const Az = newPoly(N);
        for (let j = 0; j < L; j++) {
          const aij = RejNTTPoly(xof.get(j, i));
          polyAdd(Az, MultiplyNTTs(aij, zNtt[j]));
        }
        const wApprox = crystals.NTT.decode(polySub(Az, ct12d));
        wTick1.push(polyUseHint(wApprox, h2[i]));
      }
      xof.clean();
      const c2 = shake256.create({ dkLen: C_TILDE_BYTES }).update(mu).update(W1Vec.encode(wTick1)).digest();
      for (const t of h2) {
        const sum = t.reduce((acc, i) => acc + i, 0);
        if (!(sum <= OMEGA))
          return false;
      }
      for (const t of z)
        if (polyChknorm(t, GAMMA1 - BETA))
          return false;
      return equalBytes(cTilde, c2);
    }
  };
  return {
    info: { type: "ml-dsa" },
    internal,
    securityLevel,
    keygen: internal.keygen,
    lengths: internal.lengths,
    getPublicKey: internal.getPublicKey,
    sign: (msg, secretKey, opts2 = {}) => {
      validateSigOpts(opts2);
      const M = getMessage(msg, opts2.context);
      const res = internal.sign(M, secretKey, opts2);
      cleanBytes(M);
      return res;
    },
    verify: (sig, msg, publicKey, opts2 = {}) => {
      validateVerOpts(opts2);
      return internal.verify(sig, getMessage(msg, opts2.context), publicKey);
    },
    prehash: (hash) => {
      checkHash(hash, securityLevel);
      return {
        info: { type: "hashml-dsa" },
        securityLevel,
        lengths: internal.lengths,
        keygen: internal.keygen,
        getPublicKey: internal.getPublicKey,
        sign: (msg, secretKey, opts2 = {}) => {
          validateSigOpts(opts2);
          const M = getMessagePrehash(hash, msg, opts2.context);
          const res = internal.sign(M, secretKey, opts2);
          cleanBytes(M);
          return res;
        },
        verify: (sig, msg, publicKey, opts2 = {}) => {
          validateVerOpts(opts2);
          return internal.verify(sig, getMessagePrehash(hash, msg, opts2.context), publicKey);
        }
      };
    }
  };
}
var ml_dsa44 = /* @__PURE__ */ (() => getDilithium({
  ...PARAMS[2],
  CRH_BYTES: 64,
  TR_BYTES: 64,
  C_TILDE_BYTES: 32,
  XOF128,
  XOF256,
  securityLevel: 128
}))();

// index.ts
var { xna } = require_xna();
var { xnaLegacy } = require_xna_legacy();
var { xnaPQ } = require_xna_pq();
var ECPair = ECPairFactory(ecc);
var HASH_TYPE = bitcoin2.Transaction.SIGHASH_ALL;
var LEGACY_PREFIX_LENGTH = 25;
var PQ_PREFIX_LENGTH = 22;
var PQ_PUBLIC_KEY_LENGTH = 1312;
var PQ_SECRET_KEY_LENGTH = 2560;
var PQ_KEYDATA_LENGTH = 3872;
var PQ_SEED_LENGTH = 32;
var PQ_PUBLIC_KEY_HEADER = Buffer.from([5]);
function toBitcoinJS(network) {
  return {
    messagePrefix: network.messagePrefix,
    bech32: network.bech32 || "",
    bip32: {
      public: network.versions.bip32.public,
      private: network.versions.bip32.private
    },
    pubKeyHash: network.versions.public,
    scriptHash: network.versions.scripthash,
    wif: network.versions.private
  };
}
function toBitcoinJSPQ(baseNetwork, pqNetwork) {
  return {
    ...toBitcoinJS(baseNetwork),
    bech32: pqNetwork.hrp,
    bip32: {
      public: pqNetwork.bip32.public,
      private: pqNetwork.bip32.private
    }
  };
}
function isHexString(value) {
  return /^[0-9a-f]+$/i.test(value) && value.length % 2 === 0;
}
function bufferFromHex(value, label) {
  if (!isHexString(value)) {
    throw new Error(`${label} must be a hex string`);
  }
  return Buffer.from(value, "hex");
}
function isLegacyScript(script2) {
  return script2.length >= LEGACY_PREFIX_LENGTH && script2[0] === bitcoin2.opcodes.OP_DUP && script2[1] === bitcoin2.opcodes.OP_HASH160 && script2[2] === 20 && script2[23] === bitcoin2.opcodes.OP_EQUALVERIFY && script2[24] === bitcoin2.opcodes.OP_CHECKSIG;
}
function isPQScript(script2) {
  return script2.length >= PQ_PREFIX_LENGTH && script2[0] === bitcoin2.opcodes.OP_1 && script2[1] === 20;
}
function buildP2PKHLikeScript(program) {
  return bitcoin2.script.compile([
    bitcoin2.opcodes.OP_DUP,
    bitcoin2.opcodes.OP_HASH160,
    program,
    bitcoin2.opcodes.OP_EQUALVERIFY,
    bitcoin2.opcodes.OP_CHECKSIG
  ]);
}
function getPQScriptCode(scriptPubKey) {
  if (!isPQScript(scriptPubKey)) {
    throw new Error("PQ scriptPubKey must start with OP_1 <20-byte program>");
  }
  const program = scriptPubKey.subarray(2, PQ_PREFIX_LENGTH);
  const scriptCode = buildP2PKHLikeScript(program);
  if (scriptPubKey.length === PQ_PREFIX_LENGTH) {
    return scriptCode;
  }
  return Buffer.concat([scriptCode, scriptPubKey.subarray(PQ_PREFIX_LENGTH)]);
}
function getUTXOAmount(utxo) {
  const amount = utxo.satoshis ?? utxo.value;
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error(`Invalid amount for UTXO ${utxo.txid}:${utxo.outputIndex}`);
  }
  return amount;
}
function toSerializedPQPublicKey(publicKey) {
  if (publicKey.length !== PQ_PUBLIC_KEY_LENGTH) {
    throw new Error("PQ public key must be 1312 bytes");
  }
  return Buffer.concat([PQ_PUBLIC_KEY_HEADER, publicKey]);
}
function getPQMaterialFromBuffer(data) {
  if (data.length === PQ_SEED_LENGTH) {
    const keys = ml_dsa44.keygen(new Uint8Array(data));
    const publicKey = Buffer.from(keys.publicKey);
    return {
      secretKey: Buffer.from(keys.secretKey),
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey)
    };
  }
  if (data.length === PQ_SECRET_KEY_LENGTH) {
    const publicKey = Buffer.from(ml_dsa44.getPublicKey(new Uint8Array(data)));
    return {
      secretKey: data,
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey)
    };
  }
  if (data.length === PQ_KEYDATA_LENGTH) {
    const secretKey = data.subarray(0, PQ_SECRET_KEY_LENGTH);
    const publicKey = data.subarray(PQ_SECRET_KEY_LENGTH);
    return {
      secretKey,
      publicKey,
      serializedPublicKey: toSerializedPQPublicKey(publicKey)
    };
  }
  throw new Error(
    "PQ private key must be a 32-byte seed, 2560-byte secret key or 3872-byte keydata"
  );
}
function getPQMaterialFromEntry(address, privateKeyEntry) {
  if (typeof privateKeyEntry === "string") {
    return getPQMaterialFromBuffer(
      bufferFromHex(privateKeyEntry, `PQ key for address ${address}`)
    );
  }
  const seedKey = privateKeyEntry.seedKey;
  if (seedKey) {
    return getPQMaterialFromBuffer(
      bufferFromHex(seedKey, `PQ seed for address ${address}`)
    );
  }
  const secretKeyHex = privateKeyEntry.secretKey || privateKeyEntry.privateKey;
  if (secretKeyHex) {
    const material = getPQMaterialFromBuffer(
      bufferFromHex(secretKeyHex, `PQ secret for address ${address}`)
    );
    if (privateKeyEntry.publicKey) {
      const publicKey = bufferFromHex(
        privateKeyEntry.publicKey,
        `PQ public key for address ${address}`
      );
      if (publicKey.length !== PQ_PUBLIC_KEY_LENGTH) {
        throw new Error(`PQ public key for address ${address} must be 1312 bytes`);
      }
      return {
        secretKey: material.secretKey,
        publicKey,
        serializedPublicKey: toSerializedPQPublicKey(publicKey)
      };
    }
    return material;
  }
  throw new Error(
    `Missing PQ key material for address ${address}. Provide seedKey, privateKey or secretKey in hex`
  );
}
function sign(network, rawTransactionHex, UTXOs, privateKeys) {
  const networkMapper = {
    xna: toBitcoinJS(xna.mainnet),
    "xna-test": toBitcoinJS(xna.testnet),
    "xna-legacy": toBitcoinJS(xnaLegacy.mainnet),
    "xna-legacy-test": toBitcoinJS(xnaLegacy.testnet),
    "xna-pq": toBitcoinJSPQ(xna.mainnet, xnaPQ.mainnet),
    "xna-pq-test": toBitcoinJSPQ(xna.testnet, xnaPQ.testnet)
  };
  const COIN = networkMapper[network];
  if (!COIN) throw new Error("Invalid network specified");
  COIN.bech32 = COIN.bech32 || "";
  const COIN_NETWORK = COIN;
  const unsignedTx = bitcoin2.Transaction.fromHex(rawTransactionHex);
  const tx = new bitcoin2.Transaction();
  tx.version = unsignedTx.version;
  tx.locktime = unsignedTx.locktime;
  const legacyKeyPairCache = /* @__PURE__ */ new Map();
  const pqMaterialCache = /* @__PURE__ */ new Map();
  function getKeyPairByAddress(address) {
    const cached = legacyKeyPairCache.get(address);
    if (cached) return cached;
    const privateKeyEntry = privateKeys[address];
    if (!privateKeyEntry) {
      throw new Error(`Missing private key for address: ${address}`);
    }
    const wif = typeof privateKeyEntry === "string" ? privateKeyEntry : privateKeyEntry.WIF;
    if (!wif) {
      throw new Error(`Missing WIF private key for address: ${address}`);
    }
    try {
      const keyPair = ECPair.fromWIF(wif, COIN_NETWORK);
      legacyKeyPairCache.set(address, keyPair);
      return keyPair;
    } catch (e) {
      console.error("Failed to parse WIF:", e);
      throw e;
    }
  }
  function getPQMaterialByAddress(address) {
    const cached = pqMaterialCache.get(address);
    if (cached) return cached;
    const privateKeyEntry = privateKeys[address];
    if (!privateKeyEntry) {
      throw new Error(`Missing private key for address: ${address}`);
    }
    const material = getPQMaterialFromEntry(address, privateKeyEntry);
    pqMaterialCache.set(address, material);
    return material;
  }
  function getUTXO(txid, vout) {
    return UTXOs.find((u) => u.txid === txid && u.outputIndex === vout);
  }
  for (let i = 0; i < unsignedTx.ins.length; i++) {
    const input = unsignedTx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;
    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
    tx.addInput(Buffer.from(input.hash), input.index, input.sequence, input.script);
    if (input.witness.length > 0) {
      tx.setWitness(i, input.witness);
    }
  }
  for (const out of unsignedTx.outs) {
    tx.addOutput(out.script, out.value);
  }
  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;
    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
    const scriptPubKey = Buffer.from(utxo.script, "hex");
    if (!isLegacyScript(scriptPubKey) && !isPQScript(scriptPubKey)) {
      throw new Error(
        `Unsupported prevout script for ${txid}:${vout}. Only legacy P2PKH and Neurai PQ witness v1 are supported`
      );
    }
    if (isPQScript(scriptPubKey)) {
      const pqMaterial = getPQMaterialByAddress(utxo.address);
      const scriptCode = getPQScriptCode(scriptPubKey);
      const sighash2 = tx.hashForWitnessV0(
        i,
        scriptCode,
        getUTXOAmount(utxo),
        HASH_TYPE
      );
      const signature = Buffer.from(
        ml_dsa44.sign(new Uint8Array(sighash2), new Uint8Array(pqMaterial.secretKey), {
          extraEntropy: false
        })
      );
      const signatureWithHashType2 = Buffer.concat([
        signature,
        Buffer.from([HASH_TYPE])
      ]);
      tx.setInputScript(i, Buffer.alloc(0));
      tx.setWitness(i, [signatureWithHashType2, pqMaterial.serializedPublicKey]);
      continue;
    }
    const keyPair = getKeyPairByAddress(utxo.address);
    const sighash = tx.hashForSignature(
      i,
      scriptPubKey,
      HASH_TYPE
    );
    const rawSignature = keyPair.sign(sighash);
    const signatureWithHashType = bitcoin2.script.signature.encode(
      Buffer.from(rawSignature),
      HASH_TYPE
    );
    const pubKey = keyPair.publicKey;
    const scriptSig = bitcoin2.script.compile([
      signatureWithHashType,
      Buffer.from(pubKey)
    ]);
    tx.setInputScript(i, scriptSig);
  }
  return tx.toHex();
}
var index_default = {
  sign
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sign
});
/*! Bundled license information:

@noble/hashes/utils.js:
@noble/hashes/esm/utils.js:
@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/_shortw_utils.js:
@noble/curves/secp256k1.js:
@noble/curves/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/post-quantum/utils.js:
@noble/post-quantum/_crystals.js:
@noble/post-quantum/ml-dsa.js:
  (*! noble-post-quantum - MIT License (c) 2024 Paul Miller (paulmillr.com) *)
*/
