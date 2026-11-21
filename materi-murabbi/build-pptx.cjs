const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("../.claude/skills/pptx/scripts/apply_theme.js");

const OUT = "/home/user/Animasi/materi-murabbi/Membina-Hubungan-Pribadi-dengan-Mutarabbi.pptx";
const HEX = { primary: "1E5B4A", accent: "B9740F", white: "FFFFFF", good: "2A7A4B", bad: "B1412B", ink: "18241E" };
const THEME = {
  name: "Sekolah Murabbi",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "18241E", lt1: "FFFFFF", dk2: "1E5B4A", lt2: "F1F5F2",
    accent1: "1E5B4A", accent2: "B9740F", accent3: "2A7A4B", accent4: "B1412B",
    accent5: "E1EDE8", accent6: "FAEBD3", hlink: "1E5B4A", folHlink: "B9740F",
  },
};

async function icon(name, hex) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "Membina Hubungan Pribadi dengan Mutarabbi";
  pres.subject = "Sekolah Murabbi - Daurah Paket 2";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  // C.text1 = ink, C.text2 = primary, C.background1 = white, C.background2 = pale green
  // accent2 = saffron, accent3 = good, accent4 = bad, accent5 = primary soft, accent6 = accent soft

  pres.defineSlideMaster({
    title: "Judul",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 2.5, w: 11.7, h: 2.0, fontSize: 48, bold: true, color: C.background1, valign: "top" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.6, w: 11.7, h: 1.0, fontSize: 20, color: C.accent5, valign: "top" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "Pembatas Bab",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 2.4, w: 11.7, h: 0.6, fontSize: 18, bold: true, color: C.accent6, valign: "bottom" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 3.05, w: 11.7, h: 1.6, fontSize: 44, bold: true, color: C.background1, valign: "top" }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 6.95, w: 0.7, h: 0.35, fontSize: 10, color: C.accent5, align: "right" },
  });
  pres.defineSlideMaster({
    title: "Isi",
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontSize: 34, bold: true, color: C.text2, valign: "middle", margin: 0 }, text: "" } },
      { text: { text: "Sekolah Murabbi · Membina Hubungan Pribadi dengan Mutarabbi", options: { x: 0.6, y: 6.95, w: 9, h: 0.35, fontSize: 10, color: "56665D", margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 6.95, w: 0.5, h: 0.35, fontSize: 10, color: "56665D", align: "right" },
  });

  let n = 0;
  const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontSize: 15, color: C.text1, valign: "top", objectName: "teks-" + ++n, ...o });
  const card = (s, x, y, w, h, fill, line) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: line ? { color: line, width: 1.25 } : { type: "none" }, objectName: "kartu-" + ++n });
  const dot = (s, x, y, d, fill) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, objectName: "lingkaran-" + ++n });
  const content = (title, section, sub) => {
    const s = pres.addSlide({ masterName: "Isi", sectionTitle: section });
    s.addText(title, { placeholder: "title" });
    if (sub) T(s, sub, { x: 0.6, y: 1.2, w: 12.1, h: 0.45, fontSize: 16, color: "56665D" });
    return s;
  };
  const divider = (eyebrow, title, section) => {
    const s = pres.addSlide({ masterName: "Pembatas Bab", sectionTitle: section });
    s.addText(eyebrow, { placeholder: "body" });
    s.addText(title, { placeholder: "title" });
    return s;
  };
  const bullets = (items, o = {}) => items.map((t, i) => ({ text: t, options: { bullet: o.num ? { type: "number" } : { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: o.space ?? 6 } }));

  const IC = {
    book: await icon("FaBookOpen", HEX.white), moon: await icon("FaMoon", HEX.white), flag: await icon("FaFlag", HEX.white), heart: await icon("FaHeart", HEX.white),
    check: await icon("FaCheck", HEX.white), door: await icon("FaDoorOpen", HEX.white), hands: await icon("FaHandsHelping", HEX.white), shake: await icon("FaHandshake", HEX.white),
    comments: await icon("FaComments", HEX.white), users: await icon("FaUsers", HEX.white), clock: await icon("FaClock", HEX.white), bulb: await icon("FaLightbulb", HEX.white),
    target: await icon("FaBullseye", HEX.white), link: await icon("FaLink", HEX.white),
  };
  const iconDot = (s, ic, x, y, d, fill) => { dot(s, x, y, d, fill); s.addImage({ data: ic, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5, altText: "", objectName: "ikon-" + ++n }); };

  /* 1 JUDUL */
  pres.addSection({ title: "Pembuka" });
  let s = pres.addSlide({ masterName: "Judul", sectionTitle: "Pembuka" });
  T(s, "DAURAH PAKET 2 · SEKOLAH MURABBI", { x: 0.8, y: 1.8, w: 11.7, h: 0.5, fontSize: 16, bold: true, color: C.accent6, charSpacing: 3 });
  s.addText("Membina Hubungan Pribadi dengan Mutarabbi", { placeholder: "title" });
  s.addText("Materi 2 · Bagian 1", { placeholder: "body" });
  s.addNotes("Buka dengan salam dan doa. Sampaikan bahwa tarbiyah berjalan di atas hubungan: materi sampai ke hati ketika hubungan murabbi dan mutarabbi kuat.");

  /* 2 TIGA PILAR */
  s = content("Tiga hal yang saling menguatkan", "Pembuka", "Materi ini bergerak di antara tiga pilar. Kekuatan satu pilar mengangkat dua pilar lainnya.");
  const pts = [[6.665, 2.75], [3.4, 5.65], [9.93, 5.65]];
  const ln = (x, y, w, h, flipH) => s.addShape(pres.shapes.LINE, { x, y, w, h, flipH, line: { color: C.accent2, width: 3, dashType: "dash" }, objectName: "garis-" + ++n });
  ln(pts[1][0], pts[0][1], pts[0][0] - pts[1][0], pts[1][1] - pts[0][1], true);
  ln(pts[0][0], pts[0][1], pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], false);
  ln(pts[1][0], pts[1][1], pts[2][0] - pts[1][0], 0, false);
  [["Hubungan antarpribadi", C.text2], ["Komunikasi antarpribadi", C.text2], ["Daya tarik pribadi", C.accent2]].forEach(([t, f], i) => {
    const d = 2.0; dot(s, pts[i][0] - d / 2, pts[i][1] - d / 2, d, f);
    T(s, t, { x: pts[i][0] - d / 2 + 0.15, y: pts[i][1] - d / 2, w: d - 0.3, h: d, fontSize: 17, bold: true, color: C.background1, align: "center", valign: "middle" });
  });
  s.addNotes("Hubungan antarpribadi membuka jalan komunikasi. Komunikasi yang baik memperkuat hubungan. Daya tarik pribadi murabbi membuat mutarabbi ingin mendekat.");

  /* 3 TUJUAN */
  s = content("Tujuan pembelajaran", "Pembuka", "Setelah sesi ini, peserta:");
  const goals = [["Kualitas", "Mengetahui kualitas hubungan pribadi yang harus dibangun dengan mutarabbi", IC.link],
    ["Kepribadian", "Mengetahui cara membina hubungan dengan mutarabbi yang kecenderungan kepribadiannya berbeda", IC.users],
    ["Komunikasi", "Mampu berkomunikasi secara efektif", IC.comments],
    ["Daya tarik", "Mengetahui daya tarik pribadinya dalam mengembangkan hubungan dengan mutarabbi", IC.bulb]];
  goals.forEach((g, i) => {
    const x = 0.6 + i * 3.08, y = 1.95, w = 2.8, h = 4.55;
    card(s, x, y, w, h, C.background2);
    iconDot(s, g[2], x + 0.3, y + 0.35, 0.85, C.text2);
    T(s, g[0].toUpperCase(), { x: x + 0.3, y: y + 1.45, w: w - 0.6, h: 0.4, fontSize: 14, bold: true, color: C.accent2, charSpacing: 2 });
    T(s, g[1], { x: x + 0.3, y: y + 1.95, w: w - 0.6, h: 2.4, fontSize: 17 });
  });
  s.addNotes("Bacakan keempat tujuan. Ajak peserta kembali ke slide ini di akhir sesi dan menilai sendiri tujuan mana yang sudah tercapai.");

  /* 4 SECTION */
  pres.addSection({ title: "Peran murabbi" });
  divider("Bab 1 · Mengapa perlu?", "Empat peran seorang murabbi", "Peran murabbi");

  /* 5 EMPAT PERAN */
  s = content("Murabbi memegang empat peran", "Peran murabbi", "Tiga dari empat peran menuntut kedekatan pribadi, bukan sekadar penyampaian materi.");
  const roles = [["Ustadz", "Guru yang mengajar", IC.book, ["Penyampaian materi", "Pembentukan fikrah"], ["Manhaj tarbiyah", "Pengenalan potensi belajar", "Model dan metode pembelajaran"]],
    ["Syaikh", "Pembimbing ruhani", IC.moon, ["Membina ruhiyah", "Meningkatkan kuantitas dan kualitas ibadah"], ["Tazkiyatun nafs", "Memotivasi", "Dzikir dan doa"]],
    ["Pemimpin", "Penggerak amal", IC.flag, ["Memberi penugasan", "Mengoordinasikan kegiatan"], ["Pengenalan karakter dan potensi", "Memotivasi", "Memimpin tim kerja"]],
    ["Ayah", "Sosok yang dekat", IC.heart, ["Sentuhan afeksi", "Pembentukan tingkah laku"], ["Muwashafat", "Pengenalan kepribadian", "Pengembangan hubungan pribadi", "Modifikasi tingkah laku", "Coaching dan konseling"]]];
  roles.forEach((r, i) => {
    const x = 0.6 + i * 3.08, y = 1.85, w = 2.8, h = 4.85;
    card(s, x, y, w, h, i === 3 ? C.accent6 : C.background2);
    iconDot(s, r[2], x + 0.25, y + 0.25, 0.7, i === 3 ? C.accent2 : C.text2);
    T(s, r[0], { x: x + 1.1, y: y + 0.22, w: w - 1.3, h: 0.45, fontSize: 20, bold: true, color: C.text2 });
    T(s, r[1], { x: x + 1.1, y: y + 0.62, w: w - 1.3, h: 0.35, fontSize: 13, color: "56665D" });
    T(s, [{ text: "TUGAS", options: { bold: true, color: C.accent2, fontSize: 12, charSpacing: 2, breakLine: true } }, ...bullets(r[3], { space: 2 }).map(b => ({ ...b, options: { ...b.options, fontSize: 14 } }))],
      { x: x + 0.25, y: y + 1.2, w: w - 0.45, h: 1.3 });
    T(s, [{ text: "BEKAL", options: { bold: true, color: C.accent2, fontSize: 12, charSpacing: 2, breakLine: true } }, ...bullets(r[4], { space: 2 }).map(b => ({ ...b, options: { ...b.options, fontSize: 14 } }))],
      { x: x + 0.25, y: y + 2.55, w: w - 0.45, h: 2.2 });
  });
  s.addNotes("Tekankan peran Ayah: di sinilah hubungan pribadi menjadi tugas utama. Tanyakan kepada peserta peran mana yang paling sering mereka jalankan dan mana yang paling jarang.");

  /* 6 TEBAK PERAN */
  s = content("Aktivitas · Tebak peran", "Peran murabbi", "Kelompokkan setiap bekal di bawah ke peran yang tepat. Kerjakan berpasangan, 3 menit.");
  const items = ["Menyampaikan materi", "Dzikir dan doa", "Memberi penugasan", "Sentuhan afeksi", "Pembentukan fikrah", "Coaching dan konseling", "Mengoordinasikan kegiatan", "Membina ruhiyah"];
  items.forEach((t, i) => {
    const col = i % 4, row = Math.floor(i / 4), x = 0.6 + col * 3.08, y = 1.95 + row * 0.85;
    card(s, x, y, 2.8, 0.65, C.background1, C.text2);
    T(s, t, { x: x + 0.15, y, w: 2.5, h: 0.65, fontSize: 15, bold: true, align: "center", valign: "middle" });
  });
  ["Ustadz", "Syaikh", "Pemimpin", "Ayah"].forEach((r, i) => {
    const x = 0.6 + i * 3.08, y = 3.95;
    card(s, x, y, 2.8, 2.75, C.background2);
    T(s, r, { x: x + 0.25, y: y + 0.2, w: 2.3, h: 0.45, fontSize: 20, bold: true, color: C.text2 });
    T(s, "Tulis bekal di sini", { x: x + 0.25, y: y + 0.75, w: 2.3, h: 0.4, fontSize: 13, italic: true, color: "56665D" });
  });
  s.addNotes("Kunci jawaban: Ustadz = Menyampaikan materi, Pembentukan fikrah. Syaikh = Dzikir dan doa, Membina ruhiyah. Pemimpin = Memberi penugasan, Mengoordinasikan kegiatan. Ayah = Sentuhan afeksi, Coaching dan konseling.");

  /* 7 SECTION */
  pres.addSection({ title: "Hubungan antarpribadi" });
  divider("Bab 2", "Hubungan antarpribadi", "Hubungan antarpribadi");

  /* 8 UNGKAPAN PENGALAMAN */
  s = content("Ungkapan pengalaman", "Hubungan antarpribadi");
  card(s, 0.6, 1.45, 5.6, 5.25, C.text2);
  iconDot(s, IC.comments, 0.95, 1.8, 0.85, C.accent2);
  T(s, "Ceritakan pengalaman Antum dengan murabbi yang paling Antum kagumi.", { x: 0.95, y: 2.95, w: 4.9, h: 2.4, fontSize: 28, bold: true, color: C.background1, fontFace: "+mj-lt" });
  iconDot(s, IC.clock, 0.95, 5.6, 0.6, C.accent2);
  T(s, "3 menit per orang", { x: 1.7, y: 5.6, w: 4, h: 0.6, fontSize: 17, bold: true, color: C.accent5, valign: "middle" });
  T(s, "PERTANYAAN PEMANDU", { x: 6.7, y: 1.55, w: 6, h: 0.4, fontSize: 13, bold: true, color: C.accent2, charSpacing: 2 });
  ["Apa yang membuat Antum terkesan padanya?", "Sedekat apa hubungan Antum dengannya?", "Apa momen paling berkesan bersamanya?", "Bagaimana hubungan Antum dengannya sekarang?", "Apa pengaruh kualitas hubungan itu terhadap proses tarbiyah Antum?"].forEach((q, i) => {
    const y = 2.1 + i * 0.92;
    card(s, 6.7, y, 6.0, 0.78, C.background2);
    T(s, q, { x: 6.95, y, w: 5.6, h: 0.78, fontSize: 17, valign: "middle" });
  });
  s.addNotes("Bagi peserta berpasangan atau kelompok kecil. Beri 3 menit per orang. Setelah itu minta 2-3 peserta berbagi ke forum, lalu tarik benang merah: murabbi yang membekas adalah yang hubungannya dekat.");

  /* 9 DEFINISI */
  s = content("Apa itu hubungan antarpribadi?", "Hubungan antarpribadi");
  card(s, 0.6, 1.6, 12.1, 4.2, C.background2);
  T(s, [
    { text: "Keterhubungan yang ", options: {} }, { text: "terus-menerus", options: { color: C.text2, bold: true } },
    { text: " dengan orang lain, yang selalu ada ", options: {} }, { text: "dalam pikiran dan hati", options: { color: C.text2, bold: true } },
    { text: ", baik orang itu sedang hadir maupun tidak.", options: {} }],
    { x: 1.2, y: 2.0, w: 10.9, h: 3.4, fontSize: 34, fontFace: "+mj-lt", valign: "middle" });
  T(s, "Pertanyaan untuk direnungkan: apakah mutarabbi Antum hadir dalam pikiran dan doa Antum di luar jadwal halaqah?", { x: 0.6, y: 6.05, w: 12.1, h: 0.6, fontSize: 16, italic: true, color: "56665D" });
  s.addNotes("Garis bawahi dua kata kunci: terus-menerus, serta pikiran dan hati. Hubungan tidak berhenti ketika halaqah selesai.");

  /* 10 12 CIRI */
  s = content("12 ciri hubungan pribadi yang erat", "Hubungan antarpribadi", "Cek diri: pikirkan satu mutarabbi. Ciri mana yang sudah kuat, dan mana yang belum?");
  const chars = ["Mengambil tanggung jawab", "Menunjukkan rasa hormat", "Menunjukkan kasih sayang", "Menunjukkan keterikatan", "Menunjukkan perhatian", "Terbuka dan mau mengungkapkan diri", "Aman memberi dan menerima umpan balik", "Jauh dari rasa lemah", "Menunjukkan pengertian", "Marah secara konstruktif", "Mengelola kerja sama", "Meluangkan waktu bersama"];
  chars.forEach((c, i) => {
    const col = i % 4, row = Math.floor(i / 4), x = 0.6 + col * 3.08, y = 1.85 + row * 1.65;
    card(s, x, y, 2.8, 1.45, C.background2);
    iconDot(s, IC.check, x + 0.2, y + 0.25, 0.42, C.text2);
    T(s, c, { x: x + 0.8, y: y + 0.2, w: 1.85, h: 1.05, fontSize: 16, bold: true, valign: "middle" });
  });
  s.addNotes("Minta peserta menilai setiap ciri dengan Belum, Kadang, atau Kuat untuk satu mutarabbi tertentu. Lalu pilih satu ciri terlemah untuk dikuatkan pekan ini.");

  /* 11 ALASAN */
  s = content("Mengapa orang butuh hubungan pribadi?", "Hubungan antarpribadi", "Ada dua kebutuhan dasar. Mutarabbi datang ke halaqah membawa keduanya.");
  [["ATTACHMENT", "Perasaan", "Hubungan yang intensif secara emosional: rasa diterima, disayangi, dan dirindukan.", "Murabbi menanyakan kabar keluarga mutarabbi yang sakit, bukan hanya setoran hafalannya.", IC.heart],
   ["DEPENDENCY", "Ketergantungan", "Hubungan sebagai sarana: membutuhkan bantuan, membutuhkan persetujuan, dan mencari kedekatan.", "Mutarabbi meminta pendapat murabbi sebelum memutuskan pindah kerja.", IC.hands]].forEach((a, i) => {
    const x = 0.6 + i * 6.2, y = 1.9, w = 5.9, h = 4.8;
    card(s, x, y, w, h, C.background2);
    iconDot(s, a[4], x + 0.4, y + 0.4, 0.9, C.text2);
    T(s, a[0], { x: x + 1.5, y: y + 0.42, w: 4, h: 0.35, fontSize: 13, bold: true, color: C.accent2, charSpacing: 2 });
    T(s, a[1], { x: x + 1.5, y: y + 0.75, w: 4, h: 0.6, fontSize: 28, bold: true, color: C.text2, fontFace: "+mj-lt" });
    T(s, a[2], { x: x + 0.4, y: y + 1.6, w: w - 0.8, h: 1.3, fontSize: 18 });
    card(s, x + 0.4, y + 3.1, w - 0.8, 1.35, C.background1);
    T(s, [{ text: "Di halaqah: ", options: { bold: true, color: C.text2 } }, { text: a[3] }], { x: x + 0.6, y: y + 3.1, w: w - 1.2, h: 1.35, fontSize: 16, valign: "middle" });
  });
  s.addNotes("Tanyakan: kebutuhan mana yang lebih sering dibawa mutarabbi Antum ke halaqah?");

  /* 12 SECTION */
  pres.addSection({ title: "Iklim hubungan" });
  divider("Bab 3", "Tiga iklim yang menumbuhkan hubungan", "Iklim hubungan");

  /* 13 TIGA IKLIM */
  s = content("Tiga iklim hubungan antarpribadi", "Iklim hubungan");
  [["Terbuka", "Mau mendengar, mau mengakui, dan mau berbagi. Lawannya: dogmatisme.", IC.door],
   ["Suportif", "Suasana yang mengurangi sikap defensif (bertahan) dalam komunikasi.", IC.hands],
   ["Tsiqah mutabadilah", "Saling percaya, yang menentukan efektivitas komunikasi sejak awal hubungan.", IC.shake]].forEach((c, i) => {
    const x = 0.6 + i * 4.1, y = 1.6, w = 3.85, h = 5.1;
    card(s, x, y, w, h, C.background2);
    iconDot(s, c[2], x + 0.4, y + 0.45, 1.1, C.text2);
    T(s, `Iklim ${i + 1}`.toUpperCase(), { x: x + 0.4, y: y + 1.85, w: w - 0.8, h: 0.35, fontSize: 13, bold: true, color: C.accent2, charSpacing: 2 });
    T(s, c[0], { x: x + 0.4, y: y + 2.2, w: w - 0.8, h: 0.9, fontSize: 26, bold: true, color: C.text2, fontFace: "+mj-lt" });
    T(s, c[1], { x: x + 0.4, y: y + 3.15, w: w - 0.8, h: 1.7, fontSize: 17 });
  });
  s.addNotes("Gambaran umum tiga iklim. Slide berikutnya membahas satu per satu.");

  /* 14 TERBUKA */
  s = content("Iklim 1 · Terbuka", "Iklim hubungan", "Keterbukaan amat besar pengaruhnya dalam menumbuhkan hubungan antarpribadi.");
  [["TERBUKA", C.accent3, ["Mendengar gagasan lain dengan sungguh-sungguh", "Mengakui kekurangan dan kesalahan sendiri", "Mau menceritakan diri secara wajar", "Menerima umpan balik"]],
   ["DOGMATISME (TERTUTUP)", C.accent4, ["Menolak gagasan selain miliknya", "Merasa pendapatnya pasti benar", "Enggan bercerita tentang diri", "Tersinggung ketika diberi masukan"]]].forEach((c, i) => {
    const x = 0.6 + i * 6.2, y = 1.9, w = 5.9, h = 4.8;
    card(s, x, y, w, h, C.background1, c[1]);
    T(s, c[0], { x: x + 0.4, y: y + 0.35, w: w - 0.8, h: 0.4, fontSize: 15, bold: true, color: c[1], charSpacing: 2 });
    T(s, bullets(c[2], { space: 10 }), { x: x + 0.4, y: y + 0.95, w: w - 0.8, h: 3.6, fontSize: 19 });
  });
  s.addNotes("Contoh-contoh perilaku di slide ini adalah penjabaran dari konsep terbuka lawan dogmatisme.");

  /* 15 SUPORTIF */
  s = content("Iklim 2 · Dari defensif ke suportif", "Iklim hubungan", "Defensif muncul karena faktor personal (cemas, harga diri rendah) dan faktor situasional (cara orang lain berkomunikasi).");
  const pairs = [["Evaluasi", "Antum ini malas, ya.", "Deskripsi", "Ana perhatikan tiga pekan ini antum izin halaqah. Ada yang bisa ana bantu?"],
    ["Kontrol", "Pokoknya pekan depan harus selesai, titik.", "Orientasi masalah", "Target ini terkendala di mana? Kita cari jalannya bersama."],
    ["Strategi", "Antum Sabtu senggang? (padahal mau langsung memberi tugas)", "Spontanitas", "Ana mau minta tolong antum jadi panitia Sabtu ini. Bisa?"],
    ["Netralitas", "Oh, begitu. Ya sudah.", "Empati", "Pasti berat ya kehilangan pekerjaan. Bagaimana perasaan antum?"],
    ["Superioritas", "Ana sudah lama di dakwah, antum dengar saja.", "Persamaan", "Kita sama-sama belajar. Ana juga ingin dengar pendapat antum."],
    ["Kepastian", "Caranya cuma satu, yang ana bilang.", "Provisionalisme", "Menurut ana begini, tapi ana terbuka kalau ada cara lebih baik."]];
  const hdr = (t, fill) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: fill }, fontSize: 14 } });
  const rows = [[hdr("Iklim defensif", C.accent4), hdr("Contoh kalimat", C.accent4), hdr("Iklim suportif", C.accent3), hdr("Contoh kalimat", C.accent3)]];
  pairs.forEach(p => rows.push([
    { text: p[0], options: { bold: true, color: C.accent4 } }, { text: `"${p[1]}"`, options: { italic: true } },
    { text: p[2], options: { bold: true, color: C.accent3 } }, { text: `"${p[3]}"`, options: { italic: true } }]));
  s.addTable(rows, { x: 0.6, y: 1.85, w: 12.1, colW: [1.7, 4.15, 2.0, 4.25], fontSize: 14, color: C.text1, valign: "middle", margin: [0.06, 0.1, 0.06, 0.1], border: { type: "solid", pt: 0.75, color: "D9E1DA" }, rowH: 0.65, objectName: "tabel-iklim" });
  s.addNotes("Problem tiap iklim defensif: Evaluasi, merasa dinilai. Kontrol, kita melawan yang mengontrol. Strategi, motif tersembunyi tercium. Netralitas, pembicara tidak peduli. Superioritas, merasa direndahkan. Kepastian, lawan bicara serba tahu. Bacakan kalimat defensif dulu, minta peserta mengubahnya sendiri, baru tampilkan versi suportifnya.");

  /* 16 LATIHAN DEFENSIF/SUPORTIF */
  s = content("Latihan · Defensif atau suportif?", "Iklim hubungan", "Bacakan kalimatnya. Peserta mengangkat tangan: D untuk defensif, S untuk suportif.");
  const sents = ["Kok bisa sih hafalannya cuma segitu?", "Pekan ini setoran baru satu halaman. Apa yang bikin sulit?", "Pokoknya ikuti saja, jangan banyak tanya.", "Yuk kita cari bersama jadwal yang paling pas buat antum.", "Ana dulu juga pernah mengalami. Rasanya berat, ya.", "Ana sudah sepuluh tahun mengaji, ana tahu yang terbaik.", "Mungkin ada cara lain. Ana sendiri belum yakin.", "Terserah antum lah, ana tidak ambil pusing."];
  sents.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.6 + col * 6.2, y = 1.9 + row * 1.2;
    card(s, x, y, 5.9, 1.0, C.background2);
    T(s, `"${t}"`, { x: x + 0.3, y, w: 4.2, h: 1.0, fontSize: 16, italic: true, valign: "middle" });
    ["D", "S"].forEach((l, k) => { s.addShape(pres.shapes.OVAL, { x: x + 4.7 + k * 0.6, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: C.background1 }, line: { color: k ? C.accent3 : C.accent4, width: 1.5 }, objectName: "pilihan-" + ++n });
      T(s, l, { x: x + 4.7 + k * 0.6, y: y + 0.25, w: 0.5, h: 0.5, fontSize: 15, bold: true, align: "center", valign: "middle", color: k ? C.accent3 : C.accent4 }); });
  });
  s.addNotes("Kunci (urut kiri ke kanan, atas ke bawah): 1 Defensif (evaluasi). 2 Suportif (deskripsi). 3 Defensif (kontrol). 4 Suportif (orientasi masalah). 5 Suportif (empati). 6 Defensif (superioritas). 7 Suportif (provisionalisme). 8 Defensif (netralitas).");

  /* 17 TSIQAH */
  s = content("Iklim 3 · Tsiqah mutabadilah", "Iklim hubungan", "Kepercayaan menentukan efektivitas komunikasi sejak tahap perkenalan sampai tahap peneguhan.");
  [["TIGA UNSUR TSIQAH", ["Ada situasi yang menimbulkan risiko. Tanpa risiko, kepercayaan tidak diperlukan.", "Akibat yang muncul bergantung pada perilaku orang lain.", "Yakin bahwa perilaku orang lain akan berakibat baik bagi dirinya."]],
   ["TSIQAH MENINGKATKAN HUBUNGAN KARENA", ["Membuka saluran komunikasi.", "Memperjelas pengiriman dan penerimaan informasi.", "Memperluas peluang komunikan mencapai maksudnya."]]].forEach((c, i) => {
    const x = 0.6 + i * 6.2, y = 1.9, w = 5.9, h = 4.8;
    card(s, x, y, w, h, C.background2);
    T(s, c[0], { x: x + 0.4, y: y + 0.35, w: w - 0.8, h: 0.4, fontSize: 14, bold: true, color: C.accent2, charSpacing: 2 });
    c[1].forEach((t, k) => {
      const yy = y + 1.0 + k * 1.2;
      dot(s, x + 0.4, yy, 0.55, C.text2);
      T(s, String(k + 1), { x: x + 0.4, y: yy, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle" });
      T(s, t, { x: x + 1.2, y: yy - 0.05, w: w - 1.6, h: 1.05, fontSize: 17 });
    });
  });
  s.addNotes("Hilangnya kepercayaan menghambat perkembangan hubungan yang akrab. Contoh risiko: mutarabbi menceritakan aib atau masalah keluarganya kepada murabbi.");

  /* 18 SECTION */
  pres.addSection({ title: "Kepribadian" });
  divider("Bab 4", "Mendekati aneka kecenderungan kepribadian", "Kepribadian");

  /* 19 KETERAMPILAN */
  s = content("Sembilan keterampilan membina hubungan", "Kepribadian");
  const skills = ["Mengenali diri dan perasaan sendiri", "Mengidentifikasi kebutuhan dan perasaan orang lain", "Memulai dan mengembangkan hubungan", "Berbicara tentang diri sendiri", "Penegasan diri", "Mendengar aktif", "Memberi tanggapan yang berguna", "Mengendalikan amarah dan ketegangan", "Mengendalikan konflik"];
  skills.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 0.6 + col * 4.1, y = 1.6 + row * 1.75;
    card(s, x, y, 3.85, 1.5, C.background2);
    iconDot(s, IC.target, x + 0.3, y + 0.45, 0.6, i < 2 ? C.accent2 : C.text2);
    T(s, t, { x: x + 1.1, y, w: 2.55, h: 1.5, fontSize: 17, bold: true, valign: "middle" });
  });
  s.addNotes("Dua keterampilan pertama (warna oranye) adalah fondasi: mengenali diri sendiri dan mengenali orang lain. Bab ini fokus pada mengenali kecenderungan kepribadian mutarabbi.");

  /* 20 PETA DIMENSI */
  s = content("Empat pasang kecenderungan", "Kepribadian", "Setiap orang condong ke salah satu sisi pada tiap pasangan. Tidak ada yang lebih baik; masing-masing butuh perlakuan berbeda.");
  [["ENERGI", "Introvert", "Ekstrovert", "Mengisi energi dengan menyendiri", "Mengisi energi dengan bergaul"],
   ["INFORMASI", "Sensing", "Intuitive", "Fakta, contoh konkret, langkah demi langkah", "Ide, konsep, kemungkinan baru"],
   ["KEPUTUSAN", "Thinking", "Feeling", "Analisis dan logika", "Perasaan dan keharmonisan"],
   ["GAYA HIDUP", "Judging", "Perceiving", "Teratur, terencana, tuntas", "Fleksibel, santai, terbuka pada opsi"]].forEach((d, i) => {
    const y = 1.95 + i * 1.2;
    T(s, d[0], { x: 0.6, y, w: 1.9, h: 1.0, fontSize: 14, bold: true, color: C.accent2, charSpacing: 2, valign: "middle" });
    [[d[1], d[3]], [d[2], d[4]]].forEach((p, k) => {
      const x = 2.6 + k * 5.1;
      card(s, x, y, 4.9, 1.0, k ? C.accent6 : C.accent5);
      T(s, [{ text: p[0], options: { bold: true, fontSize: 19, color: C.text2, breakLine: true } }, { text: p[1], options: { fontSize: 14, color: C.text1 } }], { x: x + 0.3, y, w: 4.3, h: 1.0, valign: "middle" });
    });
  });
  s.addNotes("Ini kecenderungan, bukan kotak yang mengurung. Gunakan untuk memahami, bukan memberi label.");

  /* 21-24 PASANGAN */
  const P = [
    ["Energi", ["I", "Introvert", ["Hargai kebutuhannya menyendiri dan privasinya", "Beri waktu berpikir sebelum ia menyampaikan gagasan", "Susun gagasan Antum sebelum bicara dengannya", "Luangkan waktu mengerjakan sesuatu berdua"], ["Memaksanya bersosialisasi dengan banyak orang"]],
                ["E", "Ekstrovert", ["Hargai kemampuannya memulai kegiatan dan obrolan", "Beri ia pengakuan dan perhatian", "Dengarkan agar ia bisa memperjelas gagasannya", "Keluar dan berinteraksi bersamanya"], ["Cemburu saat ia bergaul dengan orang lain"]]],
    ["Informasi", ["S", "Sensing", ["Hargai sikapnya yang realistis dan praktis", "Langsung ke fakta, beri contoh konkret", "Tekankan kegunaan praktis pendapat Antum", "Jelaskan langkah demi langkah"], ["Berputar-putar di konsep tanpa contoh"]],
                   ["N", "Intuitive", ["Hargai daya cipta dan orisinalitas idenya", "Dengarkan dan ikut berimajinasi tentang ide barunya", "Percayai caranya mengumpulkan informasi"], ["Membanjirinya dengan detail yang tidak penting", "Terus bertanya bagaimana ia bisa tahu"]]],
    ["Keputusan", ["T", "Thinking", ["Hargai analisis dan ketenangannya", "Minta nasihat tentang hal yang ia kuasai", "Bicarakan pikirannya, bukan perasaannya", "Dengarkan kritiknya tanpa reaktif"], ["Memaksanya menunjukkan perasaan"]],
                   ["F", "Feeling", ["Hargai kehangatan dan kepeduliannya", "Bicara secara pribadi, mulai dari hal yang disepakati", "Dengarkan, meski ia tidak meminta nasihat"], ["Menyebutnya tidak logis atau terlalu sensitif", "Buru-buru memecahkan masalahnya"]]],
    ["Gaya hidup", ["J", "Judging", ["Hargai keteraturan dan ketegasannya", "Sepakati rencana dan sebagian jadwal", "Hormati kesepakatan yang dibuat bersama"], ["Mengubah rencana mendadak", "Melanggar janji atau terlambat"]],
                    ["P", "Perceiving", ["Hargai fleksibilitas dan kesantaiannya", "Beri ruang membahas opsi, lalu sepakati tenggat", "Tegaskan hanya hal yang benar-benar wajib"], ["Memaksakan jadwal yang tidak penting", "Menuntut keputusan saat itu juga"]]]];
  const pNotes = {
    I: "Introvert: atur gagasan sebelum bicara; jangan paksa berinteraksi dengan banyak orang.",
    S: "Sensing: ajak dalam aktivitas yang banyak menggunakan penginderaan.",
    T: "Thinking: ungkapkan ketidaksetujuan tanpa khawatir. Ia sering berdebat karena menikmatinya dan tetap menghargai Antum yang berpegang pada pendapat.",
    J: "Judging: menginginkan keteraturan, setiap hal pada tempatnya, dan menghindari kekacauan." };
  P.forEach(([dim, A, B]) => {
    s = content(`${A[1]} dan ${B[1]}`, "Kepribadian", `Pasangan kecenderungan: ${dim.toLowerCase()}`);
    [A, B].forEach((p, i) => {
      const x = 0.6 + i * 6.2, y = 1.85, w = 5.9, h = 4.85;
      card(s, x, y, w, h, C.background2);
      dot(s, x + 0.35, y + 0.3, 0.8, i ? C.accent2 : C.text2);
      T(s, p[0], { x: x + 0.35, y: y + 0.3, w: 0.8, h: 0.8, fontSize: 26, bold: true, color: C.background1, align: "center", valign: "middle", fontFace: "+mj-lt" });
      T(s, `Si ${p[1]}`, { x: x + 1.35, y: y + 0.3, w: w - 1.7, h: 0.8, fontSize: 24, bold: true, color: C.text2, valign: "middle", fontFace: "+mj-lt" });
      T(s, [{ text: "LAKUKAN", options: { bold: true, color: C.accent3, fontSize: 13, charSpacing: 2, breakLine: true, paraSpaceAfter: 4 } }, ...bullets(p[2], { space: 4 })], { x: x + 0.35, y: y + 1.3, w: w - 0.7, h: 2.3, fontSize: 15 });
      T(s, [{ text: "HINDARI", options: { bold: true, color: C.accent4, fontSize: 13, charSpacing: 2, breakLine: true, paraSpaceAfter: 4 } }, ...bullets(p[3], { space: 4 })], { x: x + 0.35, y: y + 3.7, w: w - 0.7, h: 1.0, fontSize: 15 });
    });
    s.addNotes((pNotes[A[0]] || "") + " Tanyakan kepada peserta: mutarabbi mana yang condong ke sisi ini?");
  });

  /* 25 KENALI MUTARABBIMU */
  s = content("Aktivitas · Kenali mutarabbimu", "Kepribadian", "Tebak kecenderungan setiap mutarabbi, lalu sebutkan satu cara mendekatinya.");
  const cases = [["Fikri", "Jarang bicara di forum, tapi senang mengobrol berdua selepas halaqah."], ["Rafi", "Selalu bertanya 'langkah pertamanya apa?' dan minta contoh nyata."],
    ["Dimas", "Ingin tahu agenda halaqah sebulan ke depan sejak awal bulan."], ["Hasan", "Sering mengkritik ide dengan tajam, lalu tetap ramah sesudahnya."],
    ["Yusuf", "Bercerita panjang tentang masalah keluarganya, tanpa meminta saran."], ["Arif", "Paling cepat mengajak teman-teman membuat kegiatan baru."],
    ["Bayu", "Penuh ide besar dan bosan kalau dijelaskan detail teknis."], ["Salman", "Mengalir saja, dan menunda keputusan sampai semua opsi terlihat."]];
  cases.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 0.6 + col * 6.2, y = 1.85 + row * 1.22;
    card(s, x, y, 5.9, 1.05, C.background2);
    T(s, c[0], { x: x + 0.3, y, w: 1.1, h: 1.05, fontSize: 17, bold: true, color: C.text2, valign: "middle" });
    T(s, c[1], { x: x + 1.45, y, w: 4.25, h: 1.05, fontSize: 15, valign: "middle" });
  });
  s.addNotes("Kunci: Fikri = Introvert. Rafi = Sensing. Dimas = Judging. Hasan = Thinking. Yusuf = Feeling. Arif = Ekstrovert. Bayu = Intuitive. Salman = Perceiving. Nama-nama ini adalah contoh rekaan.");

  /* 26 DISKUSI */
  s = content("Diskusi kelompok · Identifikasi kebutuhan", "Kepribadian");
  card(s, 0.6, 1.45, 4.0, 5.25, C.text2);
  iconDot(s, IC.users, 0.95, 1.85, 1.0, C.accent2);
  T(s, "Bagi peserta menjadi 4 kelompok. Setiap kelompok membahas satu pasangan kecenderungan.", { x: 0.95, y: 3.15, w: 3.3, h: 2.8, fontSize: 19, color: C.background1 });
  ["Hubungan emosional seperti apa yang diharapkan oleh setiap kecenderungan kepribadian?", "Kebutuhan apa yang ingin dipenuhi oleh masing-masing kecenderungan?", "Bagaimana cara memperlakukan setiap kecenderungan kepribadian?"].forEach((q, i) => {
    const y = 1.45 + i * 1.8;
    card(s, 4.9, y, 7.8, 1.55, C.background2);
    T(s, q, { x: 5.2, y, w: 7.2, h: 1.55, fontSize: 20, bold: true, valign: "middle" });
  });
  s.addNotes("Kelompok 1: Introvert dan Ekstrovert. Kelompok 2: Sensing dan Intuitive. Kelompok 3: Thinking dan Feeling. Kelompok 4: Judging dan Perceiving. Beri 10 menit diskusi dan 2 menit presentasi per kelompok.");

  /* 27 SECTION */
  pres.addSection({ title: "Tahapan hubungan" });
  divider("Bab 5", "Perkembangan hubungan antarpribadi", "Tahapan hubungan");

  /* 28 TANGGA KNAPP */
  s = content("Tahapan hubungan menurut Knapp", "Tahapan hubungan", "Hubungan naik menuju kebersamaan, dan bisa turun menuju perpisahan.");
  const stg = [["Memulai", "Initiating"], ["Penjajagan", "Experimenting"], ["Penggiatan", "Intensifying"], ["Pengintegrasian", "Integrating"], ["Pengikatan", "Bonding"],
    ["Pembedaan", "Differentiating"], ["Pembatasan", "Circumscribing"], ["Stagnasi", "Stagnating"], ["Penghindaran", "Avoiding"], ["Pemutusan", "Terminating"]];
  const sw = 1.15, gap = 0.06, base = 6.65;
  T(s, "↗ MENUJU KEBERSAMAAN", { x: 0.6, y: 1.85, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.text2, charSpacing: 2 });
  T(s, "MENUJU PERPISAHAN ↘", { x: 7.7, y: 1.85, w: 5, h: 0.4, fontSize: 14, bold: true, color: C.accent4, charSpacing: 2, align: "right" });
  stg.forEach((st, i) => {
    const up = i < 5, lvl = up ? i : 9 - i, h = 1.0 + lvl * 0.72, x = 0.6 + i * (sw + gap) + (up ? 0 : 0.05), y = base - h;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: sw, h, rectRadius: 0.08, fill: { color: up ? C.accent5 : C.accent6 }, line: { color: up ? C.text2 : C.accent4, width: 1.25 }, objectName: "tangga-" + i });
    T(s, [{ text: st[0], options: { bold: true, fontSize: 10.5, breakLine: true } }, { text: st[1], options: { fontSize: 10, italic: true, color: "56665D" } }], { x: x + 0.04, y: y + 0.1, w: sw - 0.08, h: 0.7, align: "center" });
  });
  s.addNotes("Tanyakan: hubungan Antum dengan tiap mutarabbi sekarang berada di anak tangga mana? Penjelasan tiap tahap ada di dua slide berikutnya.");

  /* 29-30 TABEL TAHAPAN */
  const stageRows = [
    ["Memulai", "Kesan pertama: salam, penampilan, obrolan pembuka.", "Hafalkan nama, sambut dengan hangat, datang lebih awal."],
    ["Penjajagan", "Mencari kesamaan lewat obrolan ringan.", "Temukan titik temu; tanyakan hal ringan dulu."],
    ["Penggiatan", "Mulai terbuka dan berbagi cerita pribadi.", "Balas keterbukaan mutarabbi dengan keterbukaan yang wajar."],
    ["Pengintegrasian", "Merasa satu kesatuan; muncul kata 'kita'.", "Bangun identitas halaqah: tradisi kecil, proyek amal bersama."],
    ["Pengikatan", "Komitmen yang dinyatakan dan diakui bersama.", "Saling menanggung, saling mendoakan, saling menasihati."],
    ["Pembedaan", "Perbedaan ditonjolkan; 'aku' menggantikan 'kita'.", "Waspadai tanda awal; ajak bicara empat mata."],
    ["Pembatasan", "Komunikasi menyempit, topik tertentu dihindari.", "Buka kembali topik yang tertutup dengan iklim suportif."],
    ["Stagnasi", "Hubungan jalan di tempat, terasa rutin dan hambar.", "Segarkan agenda: rihlah, mabit, ganti suasana."],
    ["Penghindaran", "Menjaga jarak: sering izin, sulit dihubungi.", "Kunjungi; silaturahim pribadi lebih ampuh dari pesan grup."],
    ["Pemutusan", "Hubungan berakhir.", "Jika harus berpisah, berpisahlah dengan baik."]];
  [[0, "Naik menuju kebersamaan", C.text2], [5, "Turun menuju perpisahan", C.accent4]].forEach(([st, title, col]) => {
    s = content(title, "Tahapan hubungan");
    const r = [[hdr("Tahap", col), hdr("Ciri", col), hdr("Yang bisa dilakukan murabbi", col)]];
    stageRows.slice(st, st + 5).forEach(x => r.push([{ text: x[0], options: { bold: true, color: col } }, x[1], x[2]]));
    s.addTable(r, { x: 0.6, y: 1.5, w: 12.1, colW: [2.3, 4.6, 5.2], fontSize: 16, color: C.text1, valign: "middle", margin: [0.08, 0.12, 0.08, 0.12], border: { type: "solid", pt: 0.75, color: "D9E1DA" }, rowH: [0.55, 0.95, 0.95, 0.95, 0.95, 0.95], objectName: "tabel-tahap-" + st });
    s.addNotes("Kolom 'Yang bisa dilakukan murabbi' adalah penerapan untuk konteks halaqah, tambahan di luar teori Knapp.");
  });

  /* 31 DEVITO */
  s = content("Tahapan hubungan menurut DeVito (1997)", "Tahapan hubungan", "Di setiap tahap selalu ada pintu keluar. Hubungan tidak otomatis bertahan; ia perlu dirawat.");
  const dv = [["Kontak", "Kesan pertama"], ["Keterlibatan", "Saling mengenal lebih jauh"], ["Keakraban", "Komitmen, sahabat dekat"], ["Perusakan", "Ikatan melemah"], ["Pemutusan", "Ikatan diputus"]];
  dv.forEach((d, i) => {
    const x = 0.6 + i * 2.5, y = 2.3, w = 2.1, h = 1.7;
    card(s, x, y, w, h, i < 3 ? C.accent5 : C.accent6, i < 3 ? C.text2 : C.accent4);
    T(s, [{ text: d[0], options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } }, { text: d[1], options: { fontSize: 14 } }], { x: x + 0.12, y, w: w - 0.24, h, align: "center", valign: "middle" });
    if (i < 4) s.addShape(pres.shapes.LINE, { x: x + w + 0.05, y: y + h / 2, w: 0.3, h: 0, line: { color: C.text2, width: 2, endArrowType: "triangle" }, objectName: "panah-" + ++n });
    s.addShape(pres.shapes.LINE, { x: x + w / 2, y: y + h + 0.05, w: 0, h: 0.85, line: { color: C.accent4, width: 2, endArrowType: "triangle", dashType: "dash" }, objectName: "panah-keluar-" + ++n });
    card(s, x + 0.35, y + h + 0.95, w - 0.7, 0.55, C.background1, C.accent4);
    T(s, "Keluar", { x: x + 0.35, y: y + h + 0.95, w: w - 0.7, h: 0.55, fontSize: 15, bold: true, color: C.accent4, align: "center", valign: "middle" });
  });
  s.addNotes("Pesan utama: di tahap mana pun, mutarabbi bisa keluar dari hubungan. Tugas murabbi adalah merawat agar tidak ada yang keluar karena hubungan diabaikan.");

  /* 32 TEORI */
  pres.addSection({ title: "Teori dan komunikasi" });
  s = content("Bagaimana hubungan menjadi makin dalam?", "Teori dan komunikasi");
  const layers = [["Lapisan luar", "Biodata, hobi, keseharian", C.accent5], ["Lapisan tengah", "Sikap, pendapat, kebiasaan", "9DBFB3"], ["Lapisan dalam", "Nilai, keyakinan, harapan", "4F8A78"], ["Inti", "Ketakutan, luka, cita-cita terbesar", C.text2]];
  layers.forEach((l, i) => { const d = 4.6 - i * 1.1; dot(s, 0.8 + (4.6 - d) / 2, 1.75 + (4.6 - d) / 2, d, l[2]); });
  T(s, "Inti", { x: 2.6, y: 3.75, w: 1.0, h: 0.6, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle" });
  T(s, [{ text: "SELF DISCLOSURE", options: { bold: true, fontSize: 13, color: C.accent2, charSpacing: 2, breakLine: true } }, { text: "Pengungkapan diri: seseorang mengungkapkan informasi tentang dirinya, lalu dibalas sebaliknya.", options: { fontSize: 16 } }], { x: 6.0, y: 1.55, w: 6.7, h: 1.0 });
  T(s, [{ text: "SOCIAL PENETRATION · ALTMAN DAN TAYLOR", options: { bold: true, fontSize: 13, color: C.accent2, charSpacing: 2, breakLine: true } }, { text: "Penetrasi sosial: orang saling mengenal lapis demi lapis, dari permukaan menuju inti.", options: { fontSize: 16 } }], { x: 6.0, y: 2.7, w: 6.7, h: 1.0 });
  layers.forEach((l, i) => {
    const y = 3.95 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x: 6.0, y: y + 0.12, w: 0.35, h: 0.35, fill: { color: l[2] }, line: { color: C.text2, width: 0.75 }, objectName: "legenda-" + i });
    T(s, [{ text: l[0] + ": ", options: { bold: true } }, { text: l[1] }], { x: 6.55, y, w: 6.15, h: 0.6, fontSize: 16, valign: "middle" });
  });
  s.addNotes("Hubungan tumbuh ke dua arah: keluasan (makin banyak topik) dan kedalaman (makin dekat ke inti). Inti hanya terbuka bila mutarabbi merasa aman, maka jaga amanah dan rahasianya. Isi tiap lapisan adalah penjabaran untuk konteks halaqah.");

  /* 33 KOMUNIKASI */
  s = content("Komunikasi dan hubungan saling menguatkan", "Teori dan komunikasi", "Littlejohn (1996): hubungan antarpribadi dan komunikasi antarpribadi memiliki kaitan timbal balik.");
  card(s, 0.9, 2.3, 4.4, 1.9, C.text2);
  T(s, "Hubungan antarpribadi yang baik", { x: 1.1, y: 2.3, w: 4.0, h: 1.9, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle", fontFace: "+mj-lt" });
  card(s, 8.0, 2.3, 4.4, 1.9, C.accent2);
  T(s, "Komunikasi antarpribadi yang efektif", { x: 8.2, y: 2.3, w: 4.0, h: 1.9, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle", fontFace: "+mj-lt" });
  s.addShape(pres.shapes.LINE, { x: 5.5, y: 2.85, w: 2.3, h: 0, line: { color: C.text2, width: 3, endArrowType: "triangle" }, objectName: "panah-atas" });
  s.addShape(pres.shapes.LINE, { x: 5.5, y: 3.65, w: 2.3, h: 0, line: { color: C.accent2, width: 3, beginArrowType: "triangle" }, objectName: "panah-bawah" });
  [["Hubungan antarpribadi adalah kunci utama keefektifan komunikasi, yang disebut komunikasi relasional.", 0.9], ["Komunikasi antarpribadi yang efektif meningkatkan kualitas hubungan antarpribadi.", 6.8]].forEach(([t, x]) => {
    card(s, x, 4.75, 5.6, 1.6, C.background2);
    T(s, t, { x: x + 0.3, y: 4.75, w: 5.0, h: 1.6, fontSize: 18, valign: "middle" });
  });
  s.addNotes("Tutup bab dengan menghubungkan kembali ke tiga pilar di awal: hubungan, komunikasi, dan daya tarik pribadi saling menguatkan.");

  /* 34-35 KUIS */
  pres.addSection({ title: "Penutup" });
  const quiz = [["Peran murabbi yang berfokus pada tazkiyatun nafs, dzikir, dan doa adalah…", ["Ustadz", "Syaikh", "Pemimpin", "Ayah"], 1],
    ["Lawan dari iklim terbuka adalah…", ["Empati", "Provisionalisme", "Dogmatisme", "Spontanitas"], 2],
    ["\"Ana perhatikan pekan ini setoran antum baru satu halaman. Ada kendala?\" Ini iklim suportif jenis…", ["Deskripsi", "Kontrol", "Netralitas", "Superioritas"], 0],
    ["Mutarabbi berkecenderungan Feeling sedang bercerita tentang masalahnya. Sikap yang paling tepat…", ["Langsung memberi solusi", "Mengatakan ia terlalu sensitif", "Mendengarkan tanpa buru-buru memecahkan masalahnya", "Mengalihkan ke topik materi"], 2],
    ["Tahap ketika komunikasi menyempit dan topik tertentu dihindari disebut…", ["Penggiatan", "Pembatasan", "Pengikatan", "Penjajagan"], 1],
    ["Mana yang BUKAN unsur tsiqah?", ["Ada situasi berisiko", "Akibat bergantung pada perilaku orang lain", "Yakin perilaku orang lain berakibat baik", "Tidak ada risiko sama sekali"], 3],
    ["Menurut Littlejohn, hubungan dan komunikasi antarpribadi bersifat…", ["Terpisah", "Timbal balik", "Satu arah", "Bertentangan"], 1]];
  [[0, 4], [4, 7]].forEach(([a, b], si) => {
    s = content(`Kuis singkat (${si + 1}/2)`, "Penutup");
    const qs = quiz.slice(a, b);
    qs.forEach((q, k) => {
      const i = a + k, col = k % 2, row = Math.floor(k / 2), x = 0.6 + col * 6.2, y = 1.5 + row * 2.65, w = 5.9, h = 2.45;
      card(s, x, y, w, h, C.background2);
      dot(s, x + 0.3, y + 0.25, 0.5, C.text2);
      T(s, String(i + 1), { x: x + 0.3, y: y + 0.25, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
      T(s, q[0], { x: x + 0.95, y: y + 0.2, w: w - 1.2, h: 0.85, fontSize: 16, bold: true, valign: "middle" });
      T(s, q[1].map((o, j) => ({ text: `${"ABCD"[j]}.  ${o}`, options: { breakLine: j < 3, paraSpaceAfter: 2 } })), { x: x + 0.95, y: y + 1.12, w: w - 1.2, h: 1.25, fontSize: 14 });
    });
    s.addNotes("Kunci jawaban: " + qs.map((q, k) => `${a + k + 1}. ${"ABCD"[q[2]]} (${q[1][q[2]]})`).join("; ") + ".");
  });

  /* 36 PENUTUP */
  s = pres.addSlide({ masterName: "Judul", sectionTitle: "Penutup" });
  T(s, "TUGAS PEKAN INI", { x: 0.8, y: 1.8, w: 11.7, h: 0.5, fontSize: 16, bold: true, color: C.accent6, charSpacing: 3 });
  s.addText("Pilih satu mutarabbi. Kuatkan satu ciri hubungan erat.", { placeholder: "title" });
  s.addText("Kenali kecenderungannya, ciptakan iklim suportif, dan luangkan waktu bersama.", { placeholder: "body" });
  s.addNotes("Kembali ke slide tujuan pembelajaran dan minta peserta menilai capaian mereka. Tutup dengan doa kafaratul majelis.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
