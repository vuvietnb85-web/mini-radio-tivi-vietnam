import { useEffect, useRef } from "react";

export function AnatomyDock() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let dead = false;
    let dispose = () => {};
    void import("@/lib/anatomy-scene").then((mod) => {
      if (dead || !rootRef.current) return;
      dispose = mod.mountAnatomy(root).dispose;
    });
    return () => {
      dead = true;
      dispose();
    };
  }, []);

  return (
    <div
      className="anatomy"
      ref={rootRef}
      aria-label="Mô phỏng 3D. Kéo để xoay, chạm để đổi hệ. Nút Bài cơ xương mở bài giảng."
    >
      <canvas className="anatomy-gl" />
      <div className="anatomy-hud">
        <span className="anatomy-kicker" data-kicker>
          Hệ cơ quan
        </span>
        <span data-vitals>Đang nạp atlas giải phẫu</span>
        <button type="button" className="anatomy-teach" data-teach hidden>
          Bài cơ xương
        </button>
      </div>
      <section className="anatomy-card" data-card hidden>
        <p className="anatomy-card-kicker">
          <span data-step>1/7</span>
          <span data-title>Chìa khóa</span>
        </p>
        <p className="anatomy-card-line">
          <span className="anatomy-card-tag">Nhớ</span>
          <span className="anatomy-card-hook" data-hook />
        </p>
        <p className="anatomy-card-line">
          <span className="anatomy-card-tag">Hiểu</span>
          <span data-fact />
        </p>
        <p className="anatomy-card-line">
          <span className="anatomy-card-tag">Việc</span>
          <span data-tip />
        </p>
        <p className="anatomy-card-dots" data-dots>
          ● ○ ○ ○ ○ ○ ○
        </p>
      </section>
      <p className="anatomy-credit">Nguồn: BodyParts3D · Z-Anatomy · CC BY-SA</p>
      <canvas className="anatomy-ecg" aria-hidden="true" />
    </div>
  );
}
