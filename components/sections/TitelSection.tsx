import styles from "@/app/css/sections/TitleSection.module.css";

type Props = {
  title: string;
  eyebrow?: string;
  align?: "center" | "left";
  className?: string;
  bgcolor?: string;
  txtcolor?: string;
};

export default function SectionTitle({
  title,
  bgcolor,
  txtcolor,
  /* eyebrow, */
  align = "center",
  className,
}: Props) {
  const spacingClass = className ? className : "mb-12";
  const wrapperClasses = [
    styles.wrapper,
    align === "left" ? styles.left : styles.center,
    spacingClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (

    <section
      id="about"
      className="py-4"
      style={{ backgroundColor: bgcolor, color: txtcolor }}
    >
      <div className="container mx-auto px-6">
        {/* TITLE */}
        <div className="text-center mb-20 eight">
          <h2 className="text-4xl h1 title-cs-beauty tracking-widest" style={{ color: txtcolor }}>
            {title}
          </h2>
        </div>
      </div>
    </section>
   
  );
}
