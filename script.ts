function onOpen(e) {
  const ui = DocumentApp.getUi();
  ui.createMenu("Text Colorizer")
    .addItem("Rules", "onRulesClick")
    .addItem("Format", "format")
    .addToUi();
}
function onRulesClick() {
  const rules = PropertiesService.getDocumentProperties().getProperty("rules");
  console.log(rules);
  const processed = HtmlService.createHtmlOutputFromFile("index.html")
    .getContent()
    .replace(
      'const rulesStored = "replace-me"',
      `const rulesStored = ${rules}`,
    );
  console.log(processed);
  const ui = DocumentApp.getUi();
  const htmlOutput = HtmlService.createHtmlOutput(processed)
    .setWidth(550)
    .setHeight(700);
  ui.showModalDialog(htmlOutput, "Rules");
}
function save(rules) {
  console.log("rules --", rules);
  if (rules)
    PropertiesService.getDocumentProperties().setProperty("rules", rules);
}
function format() {
  const rulesStored =
    PropertiesService.getDocumentProperties().getProperty("rules");
  if (!rulesStored) return;
  const rules = JSON.parse(rulesStored);
  const doc = DocumentApp.getActiveDocument();

  const body = doc.getBody();
  const text = body.getText();
  const edit = body.editAsText();
  for (const rule of rules) {
    if (!rule.match) continue;
    const style = {};

    if (rule.font) style[DocumentApp.Attribute.FONT_FAMILY] = rule.font;
    if (rule.size) style[DocumentApp.Attribute.FONT_SIZE] = rule.size;
    if (rule.color) style[DocumentApp.Attribute.FOREGROUND_COLOR] = rule.color;
    if (rule.bold) style[DocumentApp.Attribute.BOLD] = !!rule.bold;
    if (rule.backColor)
      style[DocumentApp.Attribute.BACKGROUND_COLOR] = rule.backColor;

    const reg = new RegExp(rule.match, "g");
    const matches = text.matchAll(reg);
    for (const match of matches) {
      const text = match[0];
      const index = match.index;
      edit.setAttributes(index, index + text.length - 1, style);
    }
  }
}
