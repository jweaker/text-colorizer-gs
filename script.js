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
  const preProcessed =
    HtmlService.createHtmlOutputFromFile("index.html").getContent();

  const processed = !rules
    ? preProcessed
    : preProcessed.replace(
        'const rulesStored = "replace-me"',
        `const rulesStored = ${rules}`,
      );
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

    if (rule.font !== undefined)
      style[DocumentApp.Attribute.FONT_FAMILY] = rule.font;
    if (rule.size > 0) style[DocumentApp.Attribute.FONT_SIZE] = rule.size;
    if (rule.color !== undefined)
      style[DocumentApp.Attribute.FOREGROUND_COLOR] = rule.color;
    if (rule.backColor !== undefined)
      style[DocumentApp.Attribute.BACKGROUND_COLOR] = rule.backColor;
    if (rule.bold !== undefined) style[DocumentApp.Attribute.BOLD] = rule.bold;

    const reg = new RegExp(rule.match, "g");
    const matches = text.matchAll(reg);
    for (const match of matches) {
      const text = match[0];
      const index = match.index;
      edit.setAttributes(index, index + text.length - 1, style);
    }
  }
}
