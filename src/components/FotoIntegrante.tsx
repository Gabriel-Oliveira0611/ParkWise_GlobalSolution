import { useState } from "react";

type Props = {
  nome: string;
  src?: string;
  className?: string;
  prioridade?: boolean;
};

export function FotoIntegrante({
  nome,
  src,
  className = "",
  prioridade = false,
}: Props) {
  const [fotoComFalha, registrarFalha] = useState<string>();
  const iniciais = nome
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");

  return (
    <div className={"relative overflow-hidden bg-pine-50 " + className}>
      {src && fotoComFalha !== src ? (
        <img
          src={src}
          alt={"Foto de " + nome}
          width={480}
          height={480}
          loading={prioridade ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover object-[center_30%]"
          onError={() => registrarFalha(src)}
        />
      ) : (
        <div
          role="img"
          aria-label={"Foto indisponível de " + nome}
          className="flex h-full min-h-32 w-full items-center justify-center text-4xl font-bold text-pine-800"
        >
          <span aria-hidden="true">{iniciais}</span>
        </div>
      )}
    </div>
  );
}