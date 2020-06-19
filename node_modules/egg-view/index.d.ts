import { Application, PlainObject } from 'egg';

interface RenderOptions extends PlainObject {
  name?: string;
  root?: string;
  locals?: PlainObject;
  viewEngine?: string;
}

interface ViewBase {
  /**
   * Render a file by view engine
   * @param {String} name - the file path based on root
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  render(name: string, locals?: any, options?: RenderOptions): Promise<string>;

  /**
   * Render a template string by view engine
   * @param {String} tpl - template string
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  renderString(name: string, locals?: any, options?: RenderOptions): Promise<string>;
}

interface ViewManager extends Map<string, any> {
  use(name: string, viewEngine: ViewBase): void;
  resolve(name: string): Promise<string>;
}

interface ContextView extends ViewBase {
  app: Application;
  viewManager: ViewManager;
}

declare module 'egg' {
  interface Application {
    view: ViewManager;
  }

  interface Context {
    /**
     * View instance that is created every request
     */
    view: ContextView;

    /**
     * Render a file by view engine
     * @param {String} name - the file path based on root
     * @param {Object} [locals] - data used by template
     * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
     * @return {Promise<String>} result - return a promise with a render result
     */
    render(name: string, locals?: any, options?: RenderOptions): Promise<string>;

    /**
     * Render a template string by view engine
     * @param {String} tpl - template string
     * @param {Object} [locals] - data used by template
     * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
     * @return {Promise<String>} result - return a promise with a render result
     */
    renderString(name: string, locals?: any, options?: RenderOptions): Promise<string>;
  }

  interface EggAppConfig {
    view: {
      root: string;
      cache: boolean;
      defaultExtension: string;
      defaultViewEngine: string;
      mapping: PlainObject<string>;
    }
  }
}
