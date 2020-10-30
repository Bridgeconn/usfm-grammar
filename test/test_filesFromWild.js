const assert = require('assert');
const fs = require('fs');
const grammar = require('../js/main.js');

describe('Test with usfm files from the wild', () => {
  beforeEach(() => {
    if (global.gc) { global.gc(); }
  });

  it('Hindi IRV file1', () => {
    const data = fs.readFileSync('test/resources/HindiIRV5_41-MAT.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Hindi IRV file2', () => {
    const data = fs.readFileSync('test/resources/HindiIRV5_67-REV.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Tamil IRV file1', () => {
    const data = fs.readFileSync('test/resources/Tam_IRV5_57-TIT.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Tamil IRV file2', () => {
    const data = fs.readFileSync('test/resources/Tam_IRV5_46-ROM.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Greek UGNT file1', () => {
    const data = fs.readFileSync('test/resources/Greek_UGNT4_47-1CO.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Greek UGNT file2', () => {
    const data = fs.readFileSync('test/resources/Greek_UGNT4_63-1JN.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('AMT alignment export file', () => {
    const data = fs.readFileSync('test/resources/AutographaMT_Alignment_HIN_GRK_UGNT4_ACT.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('WEB file1', () => {
    const data = fs.readFileSync('test/resources/03-EXOeng-web.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('WEB file2', () => {
    const data = fs.readFileSync('test/resources/21-PROeng-web.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('WEB file3', () => {
    const data = fs.readFileSync('test/resources/75-ROMeng-web.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('t4t file1', () => {
    const data = fs.readFileSync('test/resources/13-2KIeng-t4t.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('t4t file2', () => {
    const data = fs.readFileSync('test/resources/20-PSAeng-t4t.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('t4t file3', () => {
    const data = fs.readFileSync('test/resources/74-ACTeng-t4t.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Brenton file1', () => {
    const data = fs.readFileSync('test/resources/09-RUTeng-Brenton.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Brenton file2', () => {
    const data = fs.readFileSync('test/resources/23-SNGeng-Brenton.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Chinese file1', () => {
    const data = fs.readFileSync('test/resources/18-ESTcmn-cu89s.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Chinese file2', () => {
    const data = fs.readFileSync('test/resources/32-OBAcmn-cu89s.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Chinese file3', () => {
    const data = fs.readFileSync('test/resources/94-3JNcmn-cu89s.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Revised Version file1', () => {
    const data = fs.readFileSync('test/resources/19-JOBeng-rv.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Revised Version file2', () => {
    const data = fs.readFileSync('test/resources/26-LAMeng-rv.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Revised Version file3', () => {
    const data = fs.readFileSync('test/resources/90-1PEeng-rv.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Door 43 file', () => {
    const data = fs.readFileSync('test/resources/46-ROM.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Door43 file with multiple fqa', () => {
    const usfmString = '\\id 1SA Unlocked Literal Bible\n\\ide UTF-8\n\\h 1 Samuel\n\\toc1 The First Book of Samuel\n\\toc2 First Samuel\n\\toc3 1Sa\n\\mt First Samuel \n\\c 1\n\\p\n\\v 1 There was a certain man of Ramathaim of the Zuphites, of the hill country of Ephraim; his name was Elkanah son of Jeroham son of Elihu son of Tohu son of Zuph, an Ephraimite.\n\\f + \\ft Some modern versions have \\fqa Ramathaim Zophim, \\fqa* but it is understood that \\fqa Zophim \\fqa* really refers to the region in which the clan descended from Zuph resided. \\f*\n\\v 2 He had two wives; the name of the first was Hannah, and the name of the second was Peninnah. Peninnah had children, but Hannah had none.\n\\s5\n\\v 8 David and his men attacked various places, making raids on the Geshurites, the Girzites, and the Amalekites; for those nations were the inhabitants of the land, as you go to Shur, as far as the land of Egypt. They had been living there in the land from ancient times. \\f + \\ft Instead of \\fqa the Girzites \\fqa* which is found in some ancient Hebrew copies, some modern versions have \\fqa the Gizrites \\fqa* which is found in the margin of some  Hebrew manuscripts. \\f*\n\\v 9 David attacked the land and saved neither man nor woman alive; he took away the sheep, the oxen, the donkeys, the camels, and the clothing; he would return and come again to Achish.\n';
    const myUsfmParser = new grammar.USFMParser(usfmString);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(usfmString, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('Door 43 file with trailing space and id in second line', () => {
    const data = fs.readFileSync('test/resources/01-GEN_malDoor43.usfm', 'utf-8');
    const myUsfmParser = new grammar.USFMParser(data);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(data, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });

  it('file with \\+xt within footnote', () => {
    const usfmString = '\\id PSA - (SOMEVersions) \n\\rem Copyright © 2003, 2009, 2013 .®\n\\h Забур\n\\toc1 Забур\n\\toc2 Забур\n\\toc3 Заб.\n\\mt1 Забур\n\\imt – введение\n\\ip Книга Забур состоит из ста пятидесяти песен, которые использовались как во время общих богослужений, так и для личной молитвы Всевышнему. Здесь есть песни различных видов: прославления, плачи, благодарения; песни раскаяния и упования на Всевышнего; песни о славе Иерусалима и песни для паломничества в храм; царские гимны (которые исполнялись, например, на коронациях), учительные песни, а также литургические песнопения. В песнях Забура часто выражены глубокие чувства и переживания. Здесь звучит не только радость, хвала и доверие Всевышнему, но и отчаяние, гнев, раскаяние и страх перед врагами. Многие из песен Забура пророчествуют о приходе Исы Масиха. Например, в песнях \\xt 2\\xt* и \\xt 109\\xt* Он описывается как Правитель от Всевышнего на земле, а в песни \\xt 21\\xt* предсказываются Его страдания за грехи всего человечества.\n\\ip Забур составлен очень искусно, и, чтобы читатель мог лучше его оценить, стоит сделать несколько примечаний о его структуре. Он разделён на пять книг (песни \\xt 1–40; 41–71; 72–88; 89–105; 106–150\\xt*), видимо, в подражание пяти книгам Таурата. Каждая часть заканчивается благословением. Песнь \\xt 1\\xt* служит введением для всей книги, а Песнь \\xt 150\\xt* – это заключительное благословение пятой части и всей книги Забур. Во всей книге есть части, которые изначально были отдельными сборниками. Это, например, песни восхождения (\\xt 119–133\\xt*) или песни Асафа (\\xt 72–82\\xt*). Структура каждой песни хорошо продумана, что лучше всего видно в акростихах (песни \\xt 9\\xt*, \\xt 24\\xt*, \\xt 33\\xt*, \\xt 36\\xt*, \\xt 110\\xt*, \\xt 111\\xt*, \\xt 118\\xt*, \\xt 144\\xt*).\n\\ip В большинстве случаев в начале песни есть заглавие с указаниями о манере исполнения, с информацией об авторе, жанре или историческом контексте. Так как некоторые из древних терминов, находящихся в заглавиях, сейчас плохо понятны, они могут быть переведены только приблизительно. Существует также мнение, что в некоторых случаях в начале песен упомянут не автор, а тот, о ком написана данная песнь, или кому она посвящена.\n\\ip Забур – душа Священного Писания – является любимой молитвенной книгой народа Всевышнего во всех поколениях.\n\\iot Содержание\n\\io1 Первая книга (\\ior Песни 1–40\\ior*)\n\\io1 Вторая книга (\\ior Песни 41–71\\ior*)\n\\io1 Третья книга (\\ior Песни 72–88\\ior*)\n\\io1 Четвёртая книга (\\ior Песни 89–105\\ior*)\n\\io1 Пятая книга (\\ior Песни 106–150\\ior*)\n\\ie\n\\c 1\n\\cl Песнь 1\n\\ms Первая книга\n\\q1\n\\v 1 Благословен человек,\n\\q2 который не следует совету нечестивых,\n\\q1 не ходит путями грешников\n\\q2 и не сидит в собрании насмешников,\n\\q1\n\\v 2 но в Законе Вечного\\f + \\fr 1:2 \\fk Вечный \\ft – на языке оригинала: «Яхве». Под этим именем Всевышний открылся Мусе и народу Исраила (см. \\+xt Исх. 3:13-15\\+xt*). См. пояснительный словарь.\\f* находит радость\n\\q2 и о Законе Его размышляет день и ночь.\n\\q1\n\\v 3 Он как дерево, посаженное у потоков вод,\n\\q2 которое приносит плод в своё время,\n\\q2 и чей лист не вянет.\n\\q1 Что бы он ни сделал, во всём преуспеет.\n\\b\n\\q1\n\\v 4 Не таковы нечестивые!\n\\q2 Они как мякина,\n\\q2 которую гонит ветер.\n\\q1\n\\v 5 Поэтому не устоят на суде нечестивые,\n\\q2 и грешники – в собрании праведных.\n\\b\n\\q1\n\\v 6 Ведь Вечный охраняет путь праведных,\n\\q2 а путь нечестивых погибнет.\n\\c 110\n\\cl Песнь 110\\f + \\fr 110 \\fl Песнь 110 \\ft В оригинале эта песнь написана в форме акростиха: каждая строка начинается с очередной буквы еврейского алфавита.\\f*\n\\q1\n\\b\n\\q1\n\\v 1 Славлю Вечного всем своим сердцем\n\\q2 в совете праведных и в собрании народном.\n\\b\n\\q1';
    const myUsfmParser = new grammar.USFMParser(usfmString);
    const output = myUsfmParser.validate();
    const relaxedUsfmParser = new grammar.USFMParser(usfmString, grammar.LEVEL.RELAXED);
    const relaxedOutput = relaxedUsfmParser.validate();

    assert.strictEqual(relaxedOutput, true);
    assert.strictEqual(output, true);
  });
});
