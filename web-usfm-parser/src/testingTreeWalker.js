// This fill will be deleted. This function merely exists during PR to show on benchmakrs how much overhead there is to walking the three via children only.
export function walkTheTree(node) {
  let type = node.type;
  node.children.forEach((child) => {
    walkTheTree(child);
  });
}
