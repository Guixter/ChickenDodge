'use strict';

// # Classe *Serializer*
// Classe utilitaire pour la sérialisation de données en un
// format binaire.
class Serializer {
  constructor() {
    this.data = [];
  }

  writeU8(v) {
    this.data.push(new Buffer([v]));
  }

  writeU32(v) {
    const buf = new Buffer(4);
    buf.writeUInt32LE(v);
    this.data.push(buf);
  }

  writeString(s) {
    const buf = new Buffer(s, 'utf8');
    this.writeU8(buf.length);
    this.data.push(buf);
  }

  toBinary() {
    return Buffer.concat(this.data);
  }
}

// # Classe *Deserializer*
// Classe utilitaire pour la désérialisation de données en un
// format binaire.
class Deserializer {
  constructor(buffer) {
    this.buffer = buffer;
    this.offset = 0;
  }

  peekU8() {
    return this.buffer.readUInt8(this.offset);
  }

  readU8() {
    const ret = this.peekU8();
    this.offset++;
    return ret;
  }

  peekU32() {
    return this.buffer.readUInt32LE(this.offset);
  }

  readU32() {
    const ret = this.peekU32();
    this.offset += 4;
    return ret;
  }

  readString() {
    const length = this.readU8();
    const ret = this.buffer.toString('utf8', this.offset, this.offset+length);
    this.offset += length;
    return ret;
  }
}

module.exports = {
  Serializer: Serializer,
  Deserializer: Deserializer,
};
