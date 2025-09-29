class ListGenerator {
  /* Combines the methods used for List generation from USJ */
  constructor() {
    /* Variables shared by functions */
    this.book = '';
    this.currentChapter = '';
    this.currentVerse = '';
    this.list = [['Book', 'Chapter', 'Verse', 'Text', 'Type', 'Marker']];
    this.bibleNlpFormat = { 'text': [], 'vref': [] };
    this.prevChapter = '';
    this.prevVerse = '';
  }

  usjToListId(obj) {
    /* Update book code */
    this.book = obj.code;
  }

  usjToListC(obj) {
    /* Update current chapter */
    this.currentChapter = obj.number;
    this.currentVerse = '';
  }

  usjToListV(obj) {
    /* Update current verse */
    this.currentVerse = obj.number;
  }

  usjToList(obj, excludeMarkers = null, includeMarkers = null) {
    /* Traverse the USJ dict and build the table in this.list */
    if (obj.type === 'book') {
      this.usjToListId(obj);
      if ((excludeMarkers && excludeMarkers.includes('id')) ||
                (includeMarkers && !includeMarkers.includes('id'))) {
        return;
      }
    } else if (obj.type === 'chapter') {
      this.usjToListC(obj);
    } else if (obj.type === 'verse') {
      this.usjToListV(obj);
    }

    let markerType = obj.type;
    const markerName = obj.marker ? obj.marker : '';
        
    if (markerType === 'USJ') {
      // This would occur if the JSON got flattened after removing paragraph markers
      markerType = '';
    }

    if (obj.content && obj.content.length > 0) {
      for (let item of obj.content) {
        if (typeof item === 'string') {
          if (excludeMarkers && excludeMarkers.includes('text')) {
            item = '';
          }
          this.list.push([this.book, this.currentChapter, this.currentVerse, item, markerType, markerName]);
        } else {
          this.usjToList(item, excludeMarkers, includeMarkers);
        }
      }
    } else {
      if ((!excludeMarkers && !includeMarkers) ||
                (excludeMarkers && !excludeMarkers.includes(markerName)) ||
                (includeMarkers && includeMarkers.includes(markerName))) {
        this.list.push([this.book, this.currentChapter, this.currentVerse, '', markerType, markerName]);
      }
    }
  }

  usjToBibleNlpFormat(obj) {
    // Traverse the USJ object and build a dictionary for Bible NLP format
    if (obj.type === 'book') {
      this.usjToListId(obj);
    } else if (obj.type === 'chapter') {
      this.usjToListC(obj);
    } else if (obj.type === 'verse') {
      this.usjToListV(obj);
    } else if ( obj.content) {
      for (const item of obj.content) {
        if (typeof item === 'string') {
          if (this.currentChapter === this.prevChapter &&
                        this.currentVerse === this.prevVerse) {
            this.bibleNlpFormat.text[this.bibleNlpFormat.text.length - 1] +=
                            ` ${ item.replace(/[\n\r]/g, ' ').trim()}`;
          } else {
            const vref = `${this.book} ${this.currentChapter}:${this.currentVerse}`;
            this.bibleNlpFormat.text.push(item.replace(/[\n\r]/g, ' ').trim());
            this.bibleNlpFormat.vref.push(vref);
            this.prevChapter = this.currentChapter;
            this.prevVerse = this.currentVerse;
          }
        } else {
          this.usjToBibleNlpFormat(item);
        }
      }
    }
  }

}

exports.ListGenerator = ListGenerator;
