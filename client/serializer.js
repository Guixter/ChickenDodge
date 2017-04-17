define(() => {
  'use strict';

  // # Classe *Serializer*
  // Classe utilitaire pour la sérialisation de données en un
  // format binaire.
  class Serializer {
    constructor() {
      this.data = [];
    }

    writeU8(v) {
      this.data.push(new Uint8Array([v]));
    }

    writeU32(v) {
      this.data.push(new Uint32Array([v]));
    }

    writeString(s) {
      const encoder = new TextEncoder('utf8');
      const buf = encoder.encode(s);
      this.writeU8(buf.length);
      this.data.push(buf);
    }

    toBinary() {
      return new Blob(this.data);
    }
  }

  // # Classe *Deserializer*
  // Classe utilitaire pour la désérialisation de données en un
  // format binaire.
  class Deserializer {
    constructor(arrayBuffer) {
      this.dv = new DataView(arrayBuffer);
      this.offset = 0;
    }

    peekU8() {
      return this.dv.getUint8(this.offset);
    }

    readU8() {
      const ret = this.peekU8();
      this.offset++;
      return ret;
    }

    peekU32() {
      return this.dv.getUint32(this.offset);
    }

    readU32() {
      const ret = this.peekU32();
      this.offset += 4;
      return ret;
    }

    readString() {
      const length = this.readU8();
      const decoder = new TextDecoder('utf8');
      const strView = new DataView(this.dv.buffer, this.dv.byteOffset + this.offset, length);
      const ret = decoder.decode(strView);
      this.offset += length;
      return ret;
    }
  }

  return {
    Serializer: Serializer,
    Deserializer: Deserializer,
  };
});
