const { NO_USFM_USJ_TYPES, CLOSING_USJ_TYPES, NON_ATTRIB_USJ_KEYS, NO_NEWLINE_USJ_TYPES } = require("./utils/types");
class USFMGenerator {
  constructor() {
    this.usfmString = "";
  }

  usjToUsfm(usjObj, nested = false) {

    if (!NO_USFM_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += "\\";
      if (nested && usjObj.type === "char") {
        this.usfmString += "+";
      }
      this.usfmString += `${usjObj.marker} `;
    }
    ["code", "number", "caller"].forEach((key) => {
      if (usjObj[key]) {
        this.usfmString += `${usjObj[key]} `;
      }
    });
    if (usjObj.category) {
      this.usfmString += `\\cat ${usjObj.category}\\cat*\n`;
    }
    if (usjObj.altnumber) {
      if (usjObj.marker === "c") {
        this.usfmString += `\\ca ${usjObj.altnumber} \\ca*\n`
      }else if (usjObj.marker === "v") {
        this.usfmString += `\\va ${usjObj.altnumber} \\va* `
      }
    }
    if (usjObj.pubnumber) {
      if (usjObj.marker === "c") {
        this.usfmString += `\\cp ${usjObj.pubnumber}\n`
      }else if (usjObj.marker === "v") {
        this.usfmString += `\\vp ${usjObj.pubnumber} \\vp* `
      }
    }
    if (usjObj.category) {
      this.usfmString += `\\cat ${usjObj.category}\\cat*\n`;
    }
    if (Array.isArray(usjObj.content)) {
      usjObj.content.forEach((item) => {
        if (typeof item === "string") {
          this.usfmString += item;
        } else {
          this.usjToUsfm(item, usjObj.type === "char" && item.marker !== "fv");
        }
      });
    }

    let attributes = [];
    Object.keys(usjObj).forEach((key) => {
      if (!NON_ATTRIB_USJ_KEYS.includes(key)) {
        attributes.push(`${key}="${usjObj[key]}"`);
      }
    });

    if (attributes.length > 0) {
      this.usfmString += `|${attributes.join(" ")}`;
    }

    if (CLOSING_USJ_TYPES.includes(usjObj.type)) {
      this.usfmString += `\\`;
      if (nested && usjObj.type === "char") {
        this.usfmString += "+";
      }
      this.usfmString += `${usjObj.marker}* `;
    }
    if (
      !NO_NEWLINE_USJ_TYPES.includes(usjObj.type) &&
      this.usfmString[this.usfmString.length - 1] !== "\n"
    ) {
      this.usfmString += "\n";
    }
    return this.usfmString;
  }
}

exports.USFMGenerator = USFMGenerator;
