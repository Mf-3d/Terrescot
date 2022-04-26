setInterval(() => {
  // 現在時間の取得
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  // 時、分、秒を元に角度を計算
  const degH = h * (360 / 12) + m * (360 / 12 / 60);
  const degM = m * (360 / 60);
  const degS = s * (360 / 60);

  // 各要素を取得
  const elementH = document.querySelector(".c-clock__hour");
  const elementM = document.querySelector(".c-clock__min");
  const elementS = document.querySelector(".c-clock__sec");

  // styleを追加
  elementH.style.transform = `rotate(${degH}deg)`;
  elementM.style.transform = `rotate(${degM}deg)`;
  elementS.style.transform = `rotate(${degS}deg)`;
}, 100);