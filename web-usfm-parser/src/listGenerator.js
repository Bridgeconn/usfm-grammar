class ListGenerator {
    /* Combines the methods used for List generation from USJ */
    constructor() {
        /* Variables shared by functions */
        this.book = "";
        this.currentChapter = "";
        this.currentVerse = "";
        this.list = [["Book", "Chapter", "Verse", "Text", "Type", "Marker"]];
    }

    usjToListId(obj) {
        /* Update book code */
        this.book = obj.code;
    }

    usjToListC(obj) {
        /* Update current chapter */
        this.currentChapter = obj.number;
    }

    usjToListV(obj) {
        /* Update current verse */
        this.currentVerse = obj.number;
    }

    usjToList(obj) {
        /* Traverse the USJ dict and build the table in this.list */
        if (obj.type === "book") {
            this.usjToListId(obj);
        } else if (obj.type === "chapter") {
            this.usjToListC(obj);
        } else if (obj.type === "verse") {
            this.usjToListV(obj);
        }

        let markerType = obj.type;
        let markerName = obj.marker ? obj.marker : '';
        
        if (markerType === "USJ") {
            // This would occur if the JSON got flattened after removing paragraph markers
            markerType = "";
        }

        if (obj.content) {
            for (let item of obj.content) {
                if (typeof item === "string") {
                    this.list.push([this.book, this.currentChapter, this.currentVerse, item, markerType, markerName]);
                } else {
                    this.usjToList(item);
                }
            }
        }
    }
}

export default ListGenerator;
