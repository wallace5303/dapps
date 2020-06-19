declare class CleanCommand implements SubCommand {
    description: string;
    run(_: any, { cwd }: SubCommandOption): Promise<void>;
}
declare const _default: CleanCommand;
export default _default;
//# sourceMappingURL=clean.d.ts.map