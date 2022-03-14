import { useRef, useEffect, Ref } from "react";

export default function useResizeObserver<T extends HTMLElement>(
	callback: (entries: ResizeObserverEntry[], target: T) => void
): Ref<T> {
	const targetRef = useRef<T>();

	useEffect(() => {
		if (!targetRef?.current) return;

		const target = targetRef.current;

		const observer = new ResizeObserver((entries) => {
			callback(entries, target);
		});

		observer.observe(target);

		return () => {
			if (target) observer.unobserve(target);
		};
	}, [callback]);

	return targetRef;
}
