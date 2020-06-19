declare class InitCommand implements SubCommand {
    description: string;
    options: string;
    run(_: any, { args, cwd }: SubCommandOption): Promise<void>;
}
declare const _default: InitCommand;
export default _default;
//# sourceMappingURL=init.d.ts.map