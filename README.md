# Pull Based Stream

비동기 스트림 처리를 위한 타입스크립트 라이브러리입니다. 이 라이브러리는 데이터를 비동기적으로 처리하는 Pull 기반 스트림 패턴을 구현하여, 메모리 효율적인 데이터 처리 파이프라인을 구성할 수 있게 해줍니다.

## 주요 특징

- **비동기 제너레이터 기반**: 모던 JavaScript의 비동기 제너레이터(`AsyncGenerator`)를 활용
- **타입 안전성**: TypeScript로 작성되어 완전한 타입 지원
- **메모리 효율성**: 스트림 방식으로 데이터를 처리하여 메모리 사용 최적화
- **합성 가능한 연산자**: 다양한 연산자를 조합하여 복잡한 데이터 처리 파이프라인 구성
- **듀얼 포맷 지원**: ESM과 CommonJS 모듈 형식 모두 지원

## 설치

```bash
npm install @mjparkgh/pull-stream
```

## 주요 기능

- **map**: 스트림의 각 항목을 변환하는 연산자
- **filter**: 조건에 맞는 항목만 통과시키는 필터링 연산자
- **bufferCount**: 지정된 개수만큼 항목을 묶어서 배열로 반환하는 연산자
- **pushToPullStream**: Push 기반 API를 Pull 기반 스트림으로 변환하는 어댑터
- **mergeMap**: 여러 스트림을 병합하고 변환하는 연산자, 병렬 처리 지원
- **createPullStream**: 콜백 함수를 사용하여 커스텀 스트림을 생성하는 팩토리 함수

## 사용 예제

다음은 비동기 데이터 처리 파이프라인을 구성하는 간단한 예제입니다:

```typescript
import { createPullStream, filter, map, bufferCount } from '@mjparkgh/pull-stream';

// 데이터 소스 생성
const numberStream = createPullStream<number, number>(input => {
  if (input === null) {
    return { next: 1, data: 1 }; // 초기 호출
  }
  
  const next = input + 1;
  if (next <= 20) {
    return { next, data: next };
  }
  return { next: null, data: input }; // 스트림 종료
});

// 데이터 처리 파이프라인 구성
const processedData = async () => {
  // 짝수만 필터링
  const evenNumbers = filter(numberStream, n => n % 2 === 0);
  
  // 각 숫자를 변환
  const multiplied = map(evenNumbers, async n => {
    // 비동기 작업 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 10));
    return n * 10;
  });
  
  // 3개씩 묶어서 처리
  const batched = bufferCount(multiplied, 3);
  
  // 결과 출력
  for await (const batch of batched) {
    console.log('처리된 배치:', batch);
  }
};

processedData();
// 출력:
// 처리된 배치: [20, 40, 60]
// 처리된 배치: [80, 100, 120]
// 처리된 배치: [140, 160, 180]
// 처리된 배치: [200]
```

## 이벤트 기반 API와 함께 사용하기

이벤트 기반 API를 Pull 기반 스트림으로 변환하여 사용할 수 있습니다:

```typescript
import { pushToPullStream } from '@mjparkgh/pull-stream';

// 이벤트 기반 API를 스트림으로 변환
const stream = pushToPullStream((callback) => {
  eventEmitter.on('data', (data) => callback(null, data));
  eventEmitter.on('error', (err) => callback(err, null));
  eventEmitter.on('end', () => callback(null, null, true));
});

// 일반적인 for-await 루프로 처리
async function processEvents() {
  try {
    for await (const item of stream) {
      console.log('이벤트 데이터:', item);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
```

## 모듈 포맷 지원

### ESM (ES Modules)

```javascript
import { map, filter, bufferCount } from '@mjparkgh/pull-stream';
```

### CommonJS

```javascript
const { map, filter, bufferCount } = require('@mjparkgh/pull-stream');
```

## 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 모드로 실행 (파일 변경 감지)
npm run dev

# 린트 및 코드 포맷팅
npm run lint

# 테스트 실행
npm test

# 테스트 커버리지 리포트
npm run test:coverage
```