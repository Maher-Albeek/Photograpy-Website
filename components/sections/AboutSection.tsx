import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import type { RowDataPacket } from "mysql2"
import styles from "@/app/css/sections/AboutSection.module.css"

type AboutData = {
  title: string
  intro: string
  image: string
/*   bgcolor: string
 */  txtcolor: string
}

const normalizeImagePath = (value: string) =>
  /^https?:\/\//i.test(value)
    ? value
    : "/" + value.replace(/^\/+/, "")

export default async function AboutPreviewSection({ txtcolor }: { txtcolor: string }) {
  let settings: RowDataPacket[] = []
  if (process.env.SKIP_DB !== "1") {
    const result = await db.query<RowDataPacket[]>(`
      SELECT key_name, value_content
      FROM settings
      WHERE key_name IN (
        'what_i_do_title',
        'what_i_do_intro',
        'about_image'
      )
    `)
    settings = result[0]
  }

  const map: Record<string, string> = {}
  settings.forEach((s: any) => {
    map[s.key_name] = s.value_content
  })

  const data: AboutData = {
    title: map.what_i_do_title ?? "About Me",
    intro: map.what_i_do_intro ?? "",
    image: map.about_image
      ? normalizeImagePath(map.about_image)
      : "/uploads/about/about.jpg",
    txtcolor: txtcolor,
  }

  return (
    <section
      id="about"
      className="py-14 "
      style={{  color: txtcolor }}
    
    >
      <div className="container mx-auto px-6">
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">

          {/* LEFT – CASSETTE */}
          <div className="flex justify-center lg:justify-start">
            <div className={styles.card}>
              <div className={styles.ups}>
                <div className={styles.screw1}>+</div>
                <div className={styles.screw2}>+</div>
              </div>

              <div className={styles.card1}>
                <div className={styles.line1}></div>
                <div className={styles.line2}></div>

                <div className={styles.yl}>
                  <div className={styles.roll}>
                    <div className={styles.s_wheel}></div>
                    <div className={styles.tape}></div>
                    <div className={styles.e_wheel}></div>
                  </div>
                  <p className={styles.num}>92s</p>
                </div>

                <div className={styles.or}>
                  <p className={styles.time}>2×30min</p>
                </div>
              </div>

              <div className={styles.card2_main}>
                <div className={styles.card2}>
                  <div className={styles.c1}></div>
                  <div className={styles.t1}></div>
                  <div className={styles.screw5}>+</div>
                  <div className={styles.t2}></div>
                  <div className={styles.c2}></div>
                </div>
              </div>

              <div className={styles.downs}>
                <div className={styles.screw3}>+</div>
                <div className={styles.screw4}>+</div>
              </div>
            </div>
          </div>

          {/* CENTER – TEXT */}
          <div className="max-w-md mx-auto text-center lg:text-left">
            <div className="border-l-4 border-[#ff5a00] pl-6">
              <p className="whitespace-pre-line opacity-80 mb-10 leading-relaxed">
                {data.intro}
              </p>
            </div>

            <Link href="/aboutMe" className={styles.learnMore}>
              <span className={styles.circle} aria-hidden="true">
                <span className={`${styles.icon} ${styles.arrow}`} />
              </span>
              <span className={styles.buttonText}>MEHR ÜBER MICH</span>
            </Link>
          </div>

          {/* RIGHT – IMAGE */}
          <div className="relative flex justify-center lg:justify-end">
            <div className={styles.imgWrap}>
              <div className={styles.imgBg} style={{ backgroundImage: `url(${data.image})` }} />
              <div className={styles.img}>
                <Image
                  src={data.image}
                  alt="About image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
