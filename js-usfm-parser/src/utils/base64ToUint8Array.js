function base64ToUint8Array(encoded) {
  var binaryString;
  if (typeof atob === 'function') {
    binaryString = atob(encoded);
  } else {
    binaryString = Buffer.from(encoded, 'base64').toString('binary');
  }
  var uint8Array = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return { uint8Array };
}
export { base64ToUint8Array };