// React Element 타입 체크를 위한 헬퍼 함수
export function isReactElement(
  node: React.ReactNode
): node is React.ReactElement {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    "props" in node
  );
}
