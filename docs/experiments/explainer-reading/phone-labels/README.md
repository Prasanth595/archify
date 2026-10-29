# 12px phone labels — evaluated, not adopted

After round 2, we compared a 12px physical-text floor with the adopted mobile scroll preview. The desktop sizing rule discounts secondary edge labels; this prompted a separate inspection of actual glyph sizes rather than relying only on the existing weighted readability metric.

For this singleflight sequence, actual minimum text was **10.006px** before and **12.007px** in the experiment. It was not a 7px-to-12px improvement for this case. Local scroll width grew from **755px** to **906px** inside a 332px frame. [Measurements](measurements.json).

[Adopted preview](before.png) · [12px experiment](candidate.png) · [Experimental artifact](candidate.html) · [Reproducible patch](experimental.patch).

The experimental browser checks passed (phone scrolling/export/print and existing desktop fit; [output](tests.log)). Parent visual inspection nevertheless found that the larger text left only one complete participant in the initial phone view, separating the endpoints needed to understand the exchange. We did **not** adopt this extra default change: runtime and tests were restored to the prior committed behavior. The candidate HTML remains a frozen experimental artifact and intentionally differs from the branch's reader.

This is a local tradeoff observation, not a human comprehension study or proof that 12px labels are generally worse. A narrower authored diagram or an ordered-step explanation may serve the phone better; TaskGroup in round 2 demonstrates the latter without a new runtime feature. The broader goal remains active.
