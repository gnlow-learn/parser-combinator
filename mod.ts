type Parser<A> = (str: string) => [A, string][]

const bind =
<A>(p: Parser<A>) =>
<B>(f: (a: A) => Parser<B>): Parser<B> =>
(str: string) => p(str).flatMap(([a, rest]) => f(a)(rest))

const char =
(type: string, cond: (char: string) => boolean) =>
(result: string): Parser<string> =>
    ([head, ...tail]) =>
        cond(head)
            ? [[`${result} ${type}(${head})`, tail.join("")]]
            : []

const reduce =
<A>
(f: (a1: A) => (a2: A) => A) =>
([head, ...rest]: A[]): A =>
    rest.length
        ? f(head)(reduce(f)(rest))
        : head

const option =
<A>
(p: Parser<A>) =>
(q: Parser<A>): Parser<A> =>
(str: string) => [
    ...p(str),
    ...q(str),
]

const p: Record<string, (result: string) => Parser<string>> = {
    upperChar: char("upper", char => "A" <= char && char <= "Z"),
    lowerChar: char("lower", char => "a" <= char && char <= "z"),
    space: char("space", char => char == " "),
    eof: result => ([char]) => char ? [] : [[result, ""]],
}

const anyChar = (result: string) => reduce(option)(
    Object.values(p).map(f => f(result))
)

const bindReduce =
reduce(<A>
    (f1: (a: A) => Parser<A>) =>
    (f2: (a: A) => Parser<A>) =>
    (a: A) =>
    bind(f1(a))(f2)
)

console.log(bindReduce(Array(3).fill(anyChar))("")("A "))