import { ComponentPropsWithRef, PropsWithChildren, Context } from "react";

export type DOMComponentProps<T, E> = PropsWithChildren<T> &
	ComponentPropsWithRef<E>;
