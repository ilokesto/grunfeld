Next.js page router 기준으로 설명합니다.

_app.tsx에 GrunfeldWrapper를 추가해줍니다

```tsx
import { GrunfeldWrapper } from "grunfeld"

export default function App({ Component, pageProps }: AppProps) {
  ...

  return (
    <GrunfeldWrapper>
      <Component {...pageProps} />
    </GrunfeldWrapper>
  );
}
```

grunfeld를 호출하여 토스트를 띄웁니다. grunfeld에는 success와 error가 있으며, 이에 따라 timeout progress의 색이 달라집니다.

```tsx
import { grunfeld } from 'grunfeld'

<button onClick={() => grunfeld.success("성공해버렸음ㄷㄷ", {timeout: 3000})}>성공</button>
<button onClick={() => grunfeld.error("실패해버렸음;;", {timeout: 3000})}>성공</button>
```