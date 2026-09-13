# BIOD copy pack — v1, 2026-09-13

Ad copy for the eight live concepts, plus the website copy revisions they imply.
Concepts #1–#8 only; #9 (end card) and the trailing notes are out of scope as instructed.

## Correction this pack is built on

An earlier read of this repo scored BIOD's ads "not funny." That score came from the Meta Ad
Library's `ad_creative_link_title` field — **headlines only, no video**. The films are comedy;
the copy layer around them is not. So the gap is narrower and cheaper to fix than stated:

> **Funny films, flat frames.** *More Reliable Than Ahmed* is the best-received film in the set
> and its headline field carries none of it. The joke is doing all the work with no support.

## The two products are not one product

| | Face Towel XL | Tissue Tube |
|---|---|---|
| Job | Face hygiene — what touches clean skin | On-the-go nose, car, bag |
| Enemy | The damp cloth towel | The ugly cardboard box |
| Audience | Skincare-led, female-skewing | Male-skewing (per the Lab Test brief) |
| Emotional register | Disgust → relief | Reliability → loyalty |
| Concepts | 1–6 | 7–8 |
| **Website presence** | Entire homepage | **One line in `hero.liquid`** |

**That last row is the most expensive thing in this document.** The tube is one of two main
products and the homepage has no tube story — no versus, no receipts, no FAQ, no objection
handling. Traffic from the Ahmed film lands on a page about face-towel bacteria. Fix the site
before scaling tube spend.

---

# Part 1 — Ad copy, per concept

## How to write copy around a comedy film

Four rules, because comedy ads fail differently from direct-response ads:

1. **Never spoil the bit.** The primary text sets up or follows the joke — it never tells it.
   If someone can read the copy and skip the video, the copy has cost you a view.
2. **The headline is the tag, not the setup.** Treat it like the card at the end of a sketch.
3. **Write in the film's voice, not the brand's.** A courtroom ad gets legal-notice copy. A
   breakup ad gets breakup copy. Brand voice across all eight flattens them into one ad.
4. **The claim lives in the copy, not the punchline.** Only three claims are cleared (root
   `README.md`). The joke can be about the towel; the *statistic* must be sourced.

Fields below are Meta: **PRIMARY** (above the video), **HEADLINE** (`ad_creative_link_title`),
**DESCRIPTION**, **CTA**.

---

## FACE TOWEL

### 1. BIOD NEWS — "The Face Wash Ambush"
Register: news bulletin. Recurring franchise, so the copy should feel like a running segment.

- **PRIMARY:** Breaking: the towel you used this morning has been damp since Tuesday. Our
  correspondent is on the scene and she is not being polite about it.
- **HEADLINE:** This has been BIOD News.
- **DESCRIPTION:** A fresh sheet every wash. 50 per box.
- **CTA:** Shop Now
- **Variants to test:** `We interrupt your routine for an important update.` ·
  `BIOD News, live from your bathroom.` · `Developing story: your towel.`

### 2. "Under the Microscope"
Register: straight. **This is the receipts ad — the only one that should carry the statistic
prominently,** because the film earns it.

- **PRIMARY:** We put a used face towel under a microscope. Of 82 used hand towels tested, 89%
  carried coliform bacteria and about one in four carried E. coli. Then we watched someone press
  one into their face. (Food Protection Trends, 2014.)
- **HEADLINE:** This is what you're drying your face with.
- **DESCRIPTION:** Single-use bamboo. Nothing to build up.
- **CTA:** Learn More → `/#receipts`
- **Note:** do not add a joke to this one. The film is the proof piece; comedy on top reads as
  undercutting the evidence.

### 3. "The Face Off" — Mariam & Hind *(first paid order — treat as the control)*
Register: friend intervention. Second person, mid-conversation.

- **PRIMARY:** Everyone needs a Hind. Someone who will take the damp towel out of your hand and
  explain, at volume, exactly what has been living in it.
- **HEADLINE:** Hind has opinions about your towel.
- **DESCRIPTION:** Try it for Dhs 19. One week.
- **CTA:** Shop Now
- **Variants:** `She snatched it out of her hand. Fair enough.` ·
  `This is your intervention.` · `Tell your friend. Gently. Or don't.`

### 4. "The People vs the Towel" — courtroom
Register: legal notice, played completely straight. The gap between register and subject is the joke.

- **PRIMARY:** The defendant has been damp since Tuesday. The defendant has never been washed at
  the temperature required. The defendant touches your face every single morning. The prosecution
  submits Exhibit A.
- **HEADLINE:** Exhibit A: your towel.
- **DESCRIPTION:** The court recommends a fresh sheet every wash.
- **CTA:** Shop Now
- **Variants:** `Your towel has been charged.` · `The verdict was unanimous.` ·
  `Cloth towels have been banned in this courtroom.`

### 5. "Down The Drain" / "What A Shame" — musical
Register: lyrical, rueful. Copy should read like a caption to a music video.

- **PRIMARY:** She spent a fortune on the routine. Then she dried it all off on a towel that has
  been hanging there since Tuesday. There's a song about it now.
- **HEADLINE:** All that skincare. Down the drain.
- **DESCRIPTION:** Bamboo. Single-use. Dhs 19 to start.
- **CTA:** Shop Now
- **Variants:** `Ten steps forward, one towel back.` · `What a shame.`

### 6. "Have You Seen" — Emma & Nadia
Register: trend-jacking. **Time-boxed** — the phone reference dates fast, so run it hard and early.

- **PRIMARY:** New phone. Same towel that's been on the same hook since Tuesday. One of these is
  actually ruining your week.
- **HEADLINE:** New phone. Same disgusting towel.
- **DESCRIPTION:** Priorities. Dhs 19.
- **CTA:** Shop Now
- **Note:** swap the phone reference as launches cycle; keep the sentence shape.

---

## TISSUE TUBE

### 7. "The Lab Test" — professor and supercars
Register: car enthusiast. Specs and standards, applied to a tissue box. Male-skewing.

- **PRIMARY:** You chose the car. You chose the wheels. You chose the interior down to the
  stitching. Then you put a supermarket tissue box on the seat. Sir. Respectfully.
- **HEADLINE:** Fits the cup holder. Unlike that box.
- **DESCRIPTION:** Bamboo tissue tube. Built for the cup holder.
- **CTA:** Shop Now
- **Variants:** `Everything else in here was a decision.` ·
  `Tested. Approved. Binned the box.` · `The last ugly thing in your car.`

### 8. "More Reliable Than Ahmed" *(best-received film — scale this one)*
Register: breakup. Dry, deadpan, never mean. **Do not put the punchline in the headline if you
want the view** — but this line is strong enough to earn the exception, so test both.

- **PRIMARY:** She cried. Reem listened, said the things a good friend says about an ex, and kept
  handing her tissues. Halfway through the vent she noticed the tissue hadn't fallen apart.
- **HEADLINE:** More reliable than Ahmed.
- **DESCRIPTION:** Bamboo tissue. Won't disappoint you like your ex.
- **CTA:** Shop Now
- **Variants (test the punchline held back):** `Soft. Strong. Didn't fall apart.` ·
  `One of them stayed.` · `The tissue, at least, held up.`
- **Why to scale:** it is the only concept in the set carrying a genuine emotional beat as well as
  a joke, and the tag is quotable without the video — which is what makes a line travel.

---

# Part 2 — Website copy

## 2a. The tube gap — new copy, currently missing entirely

The homepage sells one product. Below is the minimum tube story, mirroring the structures that
already work for the towel.

**Tube versus block** — same `versus` pattern, new fighters:

| Fighter | Vibe | Tag | Verdict |
|---|---|---|---|
| **BIOD Tube** | fits the cup holder | The main character | Bamboo, 3-ply, and it doesn't look like a supermarket. |
| Cardboard box | beige, enormous, everywhere | Eliminated | Designed for a shelf in 1974. Still there. |
| Pocket pack | disintegrates on contact | Eliminated | Two tissues in and you're using the packet. |

**Tube hero / section copy:**
- Kicker: `The one for everywhere else`
- Heading: `The last ugly thing in your car.`
- Body: `Bamboo tissue that fits a cup holder, survives an actual sneeze, and doesn't look like
  it came free with a delivery. Soft enough for a bad week.`
- Microcopy: `won't disappoint you like your ex`

**Tube FAQ — objection handling that doesn't exist yet:**
- `Will it actually fit my cup holder?` → give the diameter. This is the single most common
  pre-purchase question for a cup-holder product and the site answers it nowhere.
- `Is bamboo tissue strong enough?` → the Ahmed film's whole premise. Say it plainly.
- `How many sheets, and how long does one tube last?` → per-tube maths, same treatment as the
  towel's `Dhs 0.98 per towel`.
- `Is it safe for noses / sensitive skin?` → no added fragrance, no dyes.

## 2b. Revisions to live towel copy

Keep the voice — it's good, and it's already cleared. These are targeted fixes.

| Where | Now | Change to | Why |
|---|---|---|---|
| `cta.microcopy` | `free delivery over Dhs 100` | `free delivery over Dhs 70` | Bambuyu is AED 70. You currently advertise the worse number yourself. Business decision — copy is ready when you are. |
| `hero.subtext` | "Everything you wipe, dry, and toss, remade in bamboo." | `Two products. One for your face, one for everywhere else.` | Names both products in the first screen. The hero currently implies a range and sells a towel. |
| Featured collection heading | `Find your format.` | `Face or everywhere else.` | Forces the two-product choice instead of a vague browse. |
| Ad headline in rotation | `Why use that dirty towel on your pretty face?` | `Your towel has been damp since Tuesday.` | Same insight, but it mocks the towel instead of the customer. The current line blames the viewer for their own breakouts. |

## 2c. One thing not to change

Leave the `receipts` section alone. It is the only asset in this category with a peer-reviewed
citation, and it is the reason concept #2 can exist. Don't make it funnier.

---

## Ship order

1. **Headlines and primary text on the eight live concepts.** Zero production cost, today.
2. **Scale #8, keep #3 as control.** Best-received film versus first-order film.
3. **Tube website copy.** Do this before increasing tube spend, or the Ahmed film keeps landing
   on a towel page.
4. **The two offer numbers** (delivery threshold, subscription %) — business decisions, copy ready.
5. **Arabic cuts**, starting with #8 — the breakup register travels, and no competitor is there.

## Feed back per variant

Hook text, register (news / legal / breakup / car / musical / intervention), product, 3-second
retention, CTR, CVR, and whether the punchline was held back or given away in the headline. That
last column is the one nobody has data on yet, and it decides how every future comedy ad is framed.
