"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Envia o formulário para a action SEM o reset automático do React 19.
 * Com `<form action={...}>`, o React limpa os campos depois de salvar e eles
 * voltam aos valores de quando a página abriu, parecendo que nada foi salvo.
 */
export function submitWithoutReset(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
}
