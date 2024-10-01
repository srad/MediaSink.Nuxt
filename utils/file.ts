/**
 * @see https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
 * @param data JSON strinfigyable data.
 * @param filename
 * @param parentElement DOM element used to temporarily attach the download element. Mostly document.body, can be used for tests.
 */
export const downloadObjectAsJson = (data: object | any[], filename: string, parentElement: HTMLElement) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename + ".json");
  parentElement.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};