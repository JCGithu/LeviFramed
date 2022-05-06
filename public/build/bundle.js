
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Components\Banner.svelte generated by Svelte v3.47.0 */

    const { console: console_1$5 } = globals;
    const file$b = "src\\Components\\Banner.svelte";

    // (16:4) {#if roomCode}
    function create_if_block$6(ctx) {
    	let b;
    	let t0_value = (/*host*/ ctx[0] ? "Hosting" : "Room") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(/*roomCode*/ ctx[1]);
    			add_location(b, file$b, 16, 6, 389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*host*/ 1 && t0_value !== (t0_value = (/*host*/ ctx[0] ? "Hosting" : "Room") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*roomCode*/ 2) set_data_dev(t1, /*roomCode*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(16:4) {#if roomCode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let header;
    	let input;
    	let t0;
    	let h2;
    	let t2;
    	let span;
    	let t3;
    	let svg;
    	let filter;
    	let feColorMatrix0;
    	let feOffset0;
    	let feColorMatrix1;
    	let feOffset1;
    	let feBlend;
    	let mounted;
    	let dispose;
    	let if_block = /*roomCode*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			input = element("input");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Re-Framed";
    			t2 = space();
    			span = element("span");
    			if (if_block) if_block.c();
    			t3 = space();
    			svg = svg_element("svg");
    			filter = svg_element("filter");
    			feColorMatrix0 = svg_element("feColorMatrix");
    			feOffset0 = svg_element("feOffset");
    			feColorMatrix1 = svg_element("feColorMatrix");
    			feOffset1 = svg_element("feOffset");
    			feBlend = svg_element("feBlend");
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-k5el8k");
    			add_location(input, file$b, 12, 2, 258);
    			attr_dev(h2, "class", "svelte-k5el8k");
    			add_location(h2, file$b, 13, 2, 333);
    			attr_dev(span, "class", "svelte-k5el8k");
    			add_location(span, file$b, 14, 2, 355);
    			attr_dev(feColorMatrix0, "type", "matrix");
    			attr_dev(feColorMatrix0, "result", "red_");
    			attr_dev(feColorMatrix0, "values", "4 0 0 0 0\r\n              0 0 0 0 0 \r\n              0 0 0 0 0 \r\n              0 0 0 1 0");
    			add_location(feColorMatrix0, file$b, 22, 6, 521);
    			attr_dev(feOffset0, "in", "red_");
    			attr_dev(feOffset0, "dx", "1.5");
    			attr_dev(feOffset0, "dy", "0");
    			attr_dev(feOffset0, "result", "red");
    			add_location(feOffset0, file$b, 30, 6, 704);
    			attr_dev(feColorMatrix1, "type", "matrix");
    			attr_dev(feColorMatrix1, "in", "SourceGraphic");
    			attr_dev(feColorMatrix1, "result", "blue_");
    			attr_dev(feColorMatrix1, "values", "0 0 0 0 0\r\n              0 3 0 0 0 \r\n              0 0 10 0 0 \r\n              0 0 0 1 0");
    			add_location(feColorMatrix1, file$b, 31, 6, 763);
    			attr_dev(feOffset1, "in", "blue_");
    			attr_dev(feOffset1, "dx", "-1.5");
    			attr_dev(feOffset1, "dy", "0");
    			attr_dev(feOffset1, "result", "blue");
    			add_location(feOffset1, file$b, 40, 6, 976);
    			attr_dev(feBlend, "mode", "screen");
    			attr_dev(feBlend, "in", "red");
    			attr_dev(feBlend, "in2", "blue");
    			add_location(feBlend, file$b, 41, 6, 1038);
    			attr_dev(filter, "id", "chroma");
    			add_location(filter, file$b, 21, 4, 493);
    			attr_dev(svg, "width", "0");
    			attr_dev(svg, "height", "0");
    			add_location(svg, file$b, 20, 2, 461);
    			attr_dev(header, "class", "svelte-k5el8k");
    			add_location(header, file$b, 11, 0, 246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, input);
    			set_input_value(input, /*gameColour*/ ctx[2]);
    			append_dev(header, t0);
    			append_dev(header, h2);
    			append_dev(header, t2);
    			append_dev(header, span);
    			if (if_block) if_block.m(span, null);
    			append_dev(header, t3);
    			append_dev(header, svg);
    			append_dev(svg, filter);
    			append_dev(filter, feColorMatrix0);
    			append_dev(filter, feOffset0);
    			append_dev(filter, feColorMatrix1);
    			append_dev(filter, feOffset1);
    			append_dev(filter, feBlend);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(input, "change", /*updateColour*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameColour*/ 4) {
    				set_input_value(input, /*gameColour*/ ctx[2]);
    			}

    			if (/*roomCode*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Banner', slots, []);
    	let { host } = $$props;
    	let { roomCode } = $$props;
    	let gameColour = "#36d686";

    	let updateColour = () => {
    		console.log(gameColour);
    		document.querySelector(":root").style.setProperty("--accent", gameColour);
    	};

    	const writable_props = ['host', 'roomCode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		gameColour = this.value;
    		$$invalidate(2, gameColour);
    	}

    	$$self.$$set = $$props => {
    		if ('host' in $$props) $$invalidate(0, host = $$props.host);
    		if ('roomCode' in $$props) $$invalidate(1, roomCode = $$props.roomCode);
    	};

    	$$self.$capture_state = () => ({ host, roomCode, gameColour, updateColour });

    	$$self.$inject_state = $$props => {
    		if ('host' in $$props) $$invalidate(0, host = $$props.host);
    		if ('roomCode' in $$props) $$invalidate(1, roomCode = $$props.roomCode);
    		if ('gameColour' in $$props) $$invalidate(2, gameColour = $$props.gameColour);
    		if ('updateColour' in $$props) $$invalidate(3, updateColour = $$props.updateColour);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [host, roomCode, gameColour, updateColour, input_input_handler];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { host: 0, roomCode: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*host*/ ctx[0] === undefined && !('host' in props)) {
    			console_1$5.warn("<Banner> was created without expected prop 'host'");
    		}

    		if (/*roomCode*/ ctx[1] === undefined && !('roomCode' in props)) {
    			console_1$5.warn("<Banner> was created without expected prop 'roomCode'");
    		}
    	}

    	get host() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set host(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get roomCode() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roomCode(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\Components\Button.svelte generated by Svelte v3.47.0 */

    const file$a = "src\\Components\\Button.svelte";

    // (11:0) {#if error}
    function create_if_block$5(ctx) {
    	let code;
    	let t;

    	const block = {
    		c: function create() {
    			code = element("code");
    			t = text(/*error*/ ctx[2]);
    			attr_dev(code, "class", "svelte-6yrpkw");
    			add_location(code, file$a, 11, 2, 221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, code, anchor);
    			append_dev(code, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(code);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:0) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let button;
    	let button_class_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let if_block = /*error*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-6yrpkw"));
    			add_location(button, file$a, 7, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*func*/ ctx[3])) /*func*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*style*/ ctx[0]) + " svelte-6yrpkw"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (/*error*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { style } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { func = null } = $$props;
    	const writable_props = ['style', 'disabled', 'error', 'func'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('func' in $$props) $$invalidate(3, func = $$props.func);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ style, disabled, error, func });

    	$$self.$inject_state = $$props => {
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('func' in $$props) $$invalidate(3, func = $$props.func);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [style, disabled, error, func, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { style: 0, disabled: 1, error: 2, func: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*style*/ ctx[0] === undefined && !('style' in props)) {
    			console.warn("<Button> was created without expected prop 'style'");
    		}
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get func() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set func(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Error.svelte generated by Svelte v3.47.0 */

    const { Error: Error_1$2 } = globals;
    const file$9 = "src\\Components\\Error.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*msg*/ ctx[0]);
    			attr_dev(div, "class", "svelte-d53etn");
    			add_location(div, file$9, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*msg*/ 1) set_data_dev(t, /*msg*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { msg } = $$props;
    	const writable_props = ['msg'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('msg' in $$props) $$invalidate(0, msg = $$props.msg);
    	};

    	$$self.$capture_state = () => ({ msg });

    	$$self.$inject_state = $$props => {
    		if ('msg' in $$props) $$invalidate(0, msg = $$props.msg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [msg];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { msg: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*msg*/ ctx[0] === undefined && !('msg' in props)) {
    			console.warn("<Error> was created without expected prop 'msg'");
    		}
    	}

    	get msg() {
    		throw new Error_1$2("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set msg(value) {
    		throw new Error_1$2("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\IntroScreen.svelte generated by Svelte v3.47.0 */

    const { Error: Error_1$1, console: console_1$4 } = globals;
    const file$8 = "src\\Game\\IntroScreen.svelte";

    // (144:4) <Button disabled={usernameButtonOff} style={vert ? "vert" : "inline"} func={setUsername}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*usernameButton*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*usernameButton*/ 4) set_data_dev(t, /*usernameButton*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(144:4) <Button disabled={usernameButtonOff} style={vert ? \\\"vert\\\" : \\\"inline\\\"} func={setUsername}>",
    		ctx
    	});

    	return block;
    }

    // (146:2) {#if usernameSet}
    function create_if_block_1$2(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button0;
    	let t1;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: {
    				disabled: /*joinButtonOff*/ ctx[7],
    				style: /*vert*/ ctx[0] ? "vert" : "inline",
    				func: /*joinRoom*/ ctx[13],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				style: "fadeIn wide",
    				disabled: /*hostButtonOff*/ ctx[11],
    				func: /*hostGame*/ ctx[15],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			create_component(button0.$$.fragment);
    			t1 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*joinPlaceholder*/ ctx[10]);
    			attr_dev(input, "class", "svelte-izyw98");
    			add_location(input, file$8, 147, 6, 4181);
    			attr_dev(div, "class", "fadeIn inputGroup svelte-izyw98");
    			add_location(div, file$8, 146, 4, 4142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*joinCode*/ ctx[6]);
    			append_dev(div, t0);
    			mount_component(button0, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(button1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[18]),
    					listen_dev(input, "input", /*handleInput*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*joinPlaceholder*/ 1024) {
    				attr_dev(input, "placeholder", /*joinPlaceholder*/ ctx[10]);
    			}

    			if (dirty & /*joinCode*/ 64 && input.value !== /*joinCode*/ ctx[6]) {
    				set_input_value(input, /*joinCode*/ ctx[6]);
    			}

    			const button0_changes = {};
    			if (dirty & /*joinButtonOff*/ 128) button0_changes.disabled = /*joinButtonOff*/ ctx[7];
    			if (dirty & /*vert*/ 1) button0_changes.style = /*vert*/ ctx[0] ? "vert" : "inline";

    			if (dirty & /*$$scope, joinText*/ 8389120) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*hostButtonOff*/ 2048) button1_changes.disabled = /*hostButtonOff*/ ctx[11];

    			if (dirty & /*$$scope*/ 8388608) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			if (detaching) detach_dev(t1);
    			destroy_component(button1, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(146:2) {#if usernameSet}",
    		ctx
    	});

    	return block;
    }

    // (149:6) <Button disabled={joinButtonOff} style={vert ? "vert" : "inline"} func={joinRoom}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*joinText*/ ctx[9]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*joinText*/ 512) set_data_dev(t, /*joinText*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(149:6) <Button disabled={joinButtonOff} style={vert ? \\\"vert\\\" : \\\"inline\\\"} func={joinRoom}>",
    		ctx
    	});

    	return block;
    }

    // (151:4) <Button style="fadeIn wide" disabled={hostButtonOff} func={hostGame}>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Host a game!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(151:4) <Button style=\\\"fadeIn wide\\\" disabled={hostButtonOff} func={hostGame}>",
    		ctx
    	});

    	return block;
    }

    // (153:2) {#if joinError}
    function create_if_block$4(ctx) {
    	let error;
    	let current;

    	error = new Error$1({
    			props: { msg: /*joinError*/ ctx[8] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const error_changes = {};
    			if (dirty & /*joinError*/ 256) error_changes.msg = /*joinError*/ ctx[8];
    			error.$set(error_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(153:2) {#if joinError}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let header;
    	let h2;
    	let t1;
    	let a;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let br2;
    	let t6;
    	let h3;
    	let t8;
    	let br3;
    	let t9;
    	let br4;
    	let t10;
    	let t11;
    	let div0;
    	let input;
    	let t12;
    	let button;
    	let t13;
    	let t14;
    	let t15;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				disabled: /*usernameButtonOff*/ ctx[4],
    				style: /*vert*/ ctx[0] ? "vert" : "inline",
    				func: /*setUsername*/ ctx[14],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*usernameSet*/ ctx[3] && create_if_block_1$2(ctx);
    	let if_block1 = /*joinError*/ ctx[8] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			h2 = element("h2");
    			h2.textContent = "Hi!";
    			t1 = text("\r\n    This is like\r\n    ");
    			a = element("a");
    			a.textContent = "Framed";
    			t3 = text(", only with friends.\r\n    ");
    			br0 = element("br");
    			t4 = text("\r\n    Join a room or host your own.\r\n    ");
    			br1 = element("br");
    			t5 = space();
    			br2 = element("br");
    			t6 = space();
    			h3 = element("h3");
    			h3.textContent = "How to Play:";
    			t8 = text("\r\n    Each turn you will be shown a single image from a film.");
    			br3 = element("br");
    			t9 = text("Guess what you think it is! ");
    			br4 = element("br");
    			t10 = text(" Points are earned based on how few turns you take to guess the film.");
    			t11 = space();
    			div0 = element("div");
    			input = element("input");
    			t12 = space();
    			create_component(button.$$.fragment);
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			if (if_block1) if_block1.c();
    			t15 = space();
    			footer = element("footer");
    			footer.textContent = "In chat no one can hear you scream...";
    			attr_dev(h2, "class", "svelte-izyw98");
    			add_location(h2, file$8, 131, 4, 3473);
    			attr_dev(a, "href", "http://framed.wtf");
    			attr_dev(a, "class", "svelte-izyw98");
    			add_location(a, file$8, 133, 4, 3509);
    			add_location(br0, file$8, 134, 4, 3573);
    			add_location(br1, file$8, 136, 4, 3620);
    			add_location(br2, file$8, 137, 4, 3632);
    			attr_dev(h3, "class", "svelte-izyw98");
    			add_location(h3, file$8, 138, 4, 3644);
    			add_location(br3, file$8, 139, 59, 3726);
    			add_location(br4, file$8, 139, 93, 3760);
    			attr_dev(header, "class", "svelte-izyw98");
    			add_location(header, file$8, 130, 2, 3459);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*userPlaceholder*/ ctx[5]);
    			attr_dev(input, "class", "svelte-izyw98");
    			add_location(input, file$8, 142, 4, 3889);
    			attr_dev(div0, "class", "fadeIn inputGroup svelte-izyw98");
    			add_location(div0, file$8, 141, 2, 3852);
    			attr_dev(footer, "class", "svelte-izyw98");
    			add_location(footer, file$8, 155, 2, 4566);
    			attr_dev(div1, "class", "svelte-izyw98");
    			add_location(div1, file$8, 129, 0, 3450);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, h2);
    			append_dev(header, t1);
    			append_dev(header, a);
    			append_dev(header, t3);
    			append_dev(header, br0);
    			append_dev(header, t4);
    			append_dev(header, br1);
    			append_dev(header, t5);
    			append_dev(header, br2);
    			append_dev(header, t6);
    			append_dev(header, h3);
    			append_dev(header, t8);
    			append_dev(header, br3);
    			append_dev(header, t9);
    			append_dev(header, br4);
    			append_dev(header, t10);
    			append_dev(div1, t11);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*Username*/ ctx[1]);
    			append_dev(div0, t12);
    			mount_component(button, div0, null);
    			append_dev(div1, t13);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t14);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t15);
    			append_dev(div1, footer);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17]),
    					listen_dev(input, "input", /*handleInput*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*userPlaceholder*/ 32) {
    				attr_dev(input, "placeholder", /*userPlaceholder*/ ctx[5]);
    			}

    			if (dirty & /*Username*/ 2 && input.value !== /*Username*/ ctx[1]) {
    				set_input_value(input, /*Username*/ ctx[1]);
    			}

    			const button_changes = {};
    			if (dirty & /*usernameButtonOff*/ 16) button_changes.disabled = /*usernameButtonOff*/ ctx[4];
    			if (dirty & /*vert*/ 1) button_changes.style = /*vert*/ ctx[0] ? "vert" : "inline";

    			if (dirty & /*$$scope, usernameButton*/ 8388612) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*usernameSet*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*usernameSet*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t14);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*joinError*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*joinError*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t15);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getRandomInt$1(max, min) {
    	return Math.floor(Math.random() * (max - min) + min);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IntroScreen', slots, []);
    	const dispatch = createEventDispatcher();
    	let { socket } = $$props;
    	let vert = false;

    	//USERNAME
    	let Username = "";

    	let UsernameLength = false;
    	let usernameButton = "Set Username";
    	let usernameSet = false;
    	let usernameButtonOff = true;
    	let userPlaceholder = "Enter Username (Min. 4 characters)";

    	//JOIN
    	let joinCode = "";

    	let joinButtonOff = true;
    	let joinError = false;
    	let joinText = "Join!";
    	let joinPlaceholder = "Join an existing game";

    	//HOST
    	let hostButtonOff = true;

    	//MOBILE
    	if (window.innerWidth < 580) {
    		userPlaceholder = "Username";
    		usernameButton = "Enter";
    		joinPlaceholder = "Room Code";
    		vert = true;
    	}

    	const handleInput = () => {
    		UsernameLength = false;
    		$$invalidate(11, hostButtonOff = true);
    		$$invalidate(7, joinButtonOff = true);
    		$$invalidate(4, usernameButtonOff = true);

    		if (Username.length >= 4 && Username.length < 25) {
    			UsernameLength = true;
    			$$invalidate(4, usernameButtonOff = false);
    			$$invalidate(11, hostButtonOff = false);
    		}

    		if (UsernameLength && joinCode.length === 5) {
    			$$invalidate(7, joinButtonOff = false);
    			$$invalidate(11, hostButtonOff = true);
    		}
    	};

    	const joinRoom = () => {
    		socket.emit("room-exist", joinCode);
    		$$invalidate(9, joinText = "Checking room!");

    		socket.on("room-exist-return", exists => {
    			if (exists) {
    				socket.emit("join-room", joinCode);

    				dispatch("boot", {
    					room: joinCode,
    					username: Username,
    					host: false
    				});
    			} else {
    				$$invalidate(6, joinCode = "");
    				$$invalidate(9, joinText = "Join!");
    				$$invalidate(8, joinError = "Room does not exist, try again.");
    			}
    		});
    	};

    	const setUsername = () => {
    		socket.emit("set-username", Username);
    		$$invalidate(1, Username = Username.toUpperCase());
    		$$invalidate(2, usernameButton = "⏳");

    		socket.on("valid-username", valid => {
    			if (valid) {
    				$$invalidate(2, usernameButton = `Welcome ${Username}!`);

    				if (Username.length > 10) {
    					$$invalidate(2, usernameButton = `Welcome ${Username.substr(0, 10)}...!`);
    				}

    				$$invalidate(3, usernameSet = true);
    			} else {
    				$$invalidate(2, usernameButton = `${Username} taken!`);

    				if (Username.length > 10) {
    					$$invalidate(2, usernameButton = `${Username.substr(0, 10)}... taken!`);
    				}

    				$$invalidate(3, usernameSet = false);
    			}
    		});
    	};

    	let hostCode;

    	async function roomCheckLoop() {
    		return new Promise((res, req) => {
    				hostCode = getRandomInt$1(99999, 10000);
    				console.log(`Checking if room ${hostCode} exists`);
    				socket.emit("room-exist", hostCode);

    				socket.on("room-exist-return", async exists => {
    					if (exists) {
    						hostCode++;
    						roomCheckLoop();
    					} else {
    						console.log(`Success, no room found! Now hosting with room code: ${hostCode}`);
    						socket.emit("join-room", hostCode);

    						dispatch("boot", {
    							room: hostCode,
    							username: Username,
    							host: true
    						});

    						res(hostCode);
    					}
    				});
    			});
    	}

    	const hostGame = async () => {
    		let roomCode = await roomCheckLoop();
    		console.log(roomCode);
    	};

    	const writable_props = ['socket'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<IntroScreen> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		Username = this.value;
    		$$invalidate(1, Username);
    	}

    	function input_input_handler_1() {
    		joinCode = this.value;
    		$$invalidate(6, joinCode);
    	}

    	$$self.$$set = $$props => {
    		if ('socket' in $$props) $$invalidate(16, socket = $$props.socket);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		slide,
    		socket,
    		Button,
    		Error: Error$1,
    		vert,
    		Username,
    		UsernameLength,
    		usernameButton,
    		usernameSet,
    		usernameButtonOff,
    		userPlaceholder,
    		joinCode,
    		joinButtonOff,
    		joinError,
    		joinText,
    		joinPlaceholder,
    		hostButtonOff,
    		getRandomInt: getRandomInt$1,
    		handleInput,
    		joinRoom,
    		setUsername,
    		hostCode,
    		roomCheckLoop,
    		hostGame
    	});

    	$$self.$inject_state = $$props => {
    		if ('socket' in $$props) $$invalidate(16, socket = $$props.socket);
    		if ('vert' in $$props) $$invalidate(0, vert = $$props.vert);
    		if ('Username' in $$props) $$invalidate(1, Username = $$props.Username);
    		if ('UsernameLength' in $$props) UsernameLength = $$props.UsernameLength;
    		if ('usernameButton' in $$props) $$invalidate(2, usernameButton = $$props.usernameButton);
    		if ('usernameSet' in $$props) $$invalidate(3, usernameSet = $$props.usernameSet);
    		if ('usernameButtonOff' in $$props) $$invalidate(4, usernameButtonOff = $$props.usernameButtonOff);
    		if ('userPlaceholder' in $$props) $$invalidate(5, userPlaceholder = $$props.userPlaceholder);
    		if ('joinCode' in $$props) $$invalidate(6, joinCode = $$props.joinCode);
    		if ('joinButtonOff' in $$props) $$invalidate(7, joinButtonOff = $$props.joinButtonOff);
    		if ('joinError' in $$props) $$invalidate(8, joinError = $$props.joinError);
    		if ('joinText' in $$props) $$invalidate(9, joinText = $$props.joinText);
    		if ('joinPlaceholder' in $$props) $$invalidate(10, joinPlaceholder = $$props.joinPlaceholder);
    		if ('hostButtonOff' in $$props) $$invalidate(11, hostButtonOff = $$props.hostButtonOff);
    		if ('hostCode' in $$props) hostCode = $$props.hostCode;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		vert,
    		Username,
    		usernameButton,
    		usernameSet,
    		usernameButtonOff,
    		userPlaceholder,
    		joinCode,
    		joinButtonOff,
    		joinError,
    		joinText,
    		joinPlaceholder,
    		hostButtonOff,
    		handleInput,
    		joinRoom,
    		setUsername,
    		hostGame,
    		socket,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class IntroScreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { socket: 16 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntroScreen",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*socket*/ ctx[16] === undefined && !('socket' in props)) {
    			console_1$4.warn("<IntroScreen> was created without expected prop 'socket'");
    		}
    	}

    	get socket() {
    		throw new Error_1$1("<IntroScreen>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set socket(value) {
    		throw new Error_1$1("<IntroScreen>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\PlayersList.svelte generated by Svelte v3.47.0 */
    const file$7 = "src\\Game\\PlayersList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each players as player}
    function create_each_block$3(ctx) {
    	let span;
    	let t_value = /*player*/ ctx[1] + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "player svelte-1ohp2hi");
    			add_location(span, file$7, 9, 6, 201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*players*/ 1 && t_value !== (t_value = /*player*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: 20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(9:4) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let h4;
    	let t1;
    	let div;
    	let section_intro;
    	let each_value = /*players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h4 = element("h4");
    			h4.textContent = "Players in Lobby";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h4, "class", "svelte-1ohp2hi");
    			add_location(h4, file$7, 6, 2, 128);
    			attr_dev(div, "class", "svelte-1ohp2hi");
    			add_location(div, file$7, 7, 2, 157);
    			attr_dev(section, "class", "svelte-1ohp2hi");
    			add_location(section, file$7, 5, 0, 95);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h4);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*players*/ 1) {
    				each_value = /*players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!section_intro) {
    				add_render_callback(() => {
    					section_intro = create_in_transition(section, fly, { y: 110 });
    					section_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PlayersList', slots, []);
    	let { players = [] } = $$props;
    	const writable_props = ['players'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PlayersList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	$$self.$capture_state = () => ({ players, fly });

    	$$self.$inject_state = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [players];
    }

    class PlayersList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { players: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayersList",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get players() {
    		throw new Error("<PlayersList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<PlayersList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\Lobby.svelte generated by Svelte v3.47.0 */
    const file$6 = "src\\Game\\Lobby.svelte";

    function create_fragment$6(ctx) {
    	let h2;
    	let t1;
    	let playerslist;
    	let t2;
    	let h3;
    	let t4;
    	let h4;
    	let current;

    	playerslist = new PlayersList({
    			props: { players: /*players*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "You are in the Lobby";
    			t1 = space();
    			create_component(playerslist.$$.fragment);
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "The host will start the game.";
    			t4 = space();
    			h4 = element("h4");
    			h4.textContent = "Why not grab some popcorn or a refreshing drink while you're here?";
    			add_location(h2, file$6, 5, 0, 97);
    			add_location(h3, file$6, 7, 0, 155);
    			add_location(h4, file$6, 8, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(playerslist, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h4, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const playerslist_changes = {};
    			if (dirty & /*players*/ 1) playerslist_changes.players = /*players*/ ctx[0];
    			playerslist.$set(playerslist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playerslist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playerslist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_component(playerslist, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Lobby', slots, []);
    	let { players } = $$props;
    	const writable_props = ['players'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lobby> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	$$self.$capture_state = () => ({ players, PlayersList });

    	$$self.$inject_state = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [players];
    }

    class Lobby extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { players: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lobby",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[0] === undefined && !('players' in props)) {
    			console.warn("<Lobby> was created without expected prop 'players'");
    		}
    	}

    	get players() {
    		throw new Error("<Lobby>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<Lobby>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\HostSettings.svelte generated by Svelte v3.47.0 */
    const file$5 = "src\\Game\\HostSettings.svelte";

    // (77:2) <Button style="wide margin-top" func={startGame}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Play!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(77:2) <Button style=\\\"wide margin-top\\\" func={startGame}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let h1;
    	let t1;
    	let div2;
    	let h3;
    	let t3;
    	let span;
    	let input;
    	let t4;
    	let div0;
    	let svg0;
    	let path0;
    	let div0_intro;
    	let t5;
    	let div1;
    	let svg1;
    	let path1;
    	let div1_intro;
    	let t6;
    	let button;
    	let t7;
    	let playerslist;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				style: "wide margin-top",
    				func: /*startGame*/ ctx[5],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	playerslist = new PlayersList({
    			props: { players: /*players*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Settings";
    			t1 = space();
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Number of Rounds";
    			t3 = space();
    			span = element("span");
    			input = element("input");
    			t4 = space();
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t5 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t6 = space();
    			create_component(button.$$.fragment);
    			t7 = space();
    			create_component(playerslist.$$.fragment);
    			add_location(h1, file$5, 41, 2, 909);
    			attr_dev(h3, "class", "svelte-1p19jg8");
    			add_location(h3, file$5, 43, 4, 960);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "10");
    			attr_dev(input, "class", "svelte-1p19jg8");
    			add_location(input, file$5, 45, 6, 1020);
    			attr_dev(path0, "d", "M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 8.66c-.207.102-.31.206-.516.206a.788.788 0 0 1-.516-.207l-3.402-3.402a.314.314 0 0 0-.412 0l-3.402 3.402a.809.809 0 0 1-1.134 0 .809.809 0 0 1 0-1.134L10.66 9.01a1.805 1.805 0 0 1 2.577 0l3.402 3.402c.31.413.31.825 0 1.134Z");
    			attr_dev(path0, "fill", "#232323");
    			attr_dev(path0, "class", "svelte-1p19jg8");
    			add_location(path0, file$5, 48, 11, 1251);
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-1p19jg8");
    			add_location(svg0, file$5, 47, 8, 1144);
    			attr_dev(div0, "class", "svelte-1p19jg8");
    			add_location(div0, file$5, 46, 6, 1093);
    			attr_dev(path1, "d", "M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 6.598-3.403 3.402c-.31.309-.825.515-1.237.515-.412 0-.928-.206-1.237-.515L7.36 11.485a.809.809 0 0 1 0-1.134.809.809 0 0 1 1.134 0l3.402 3.402c.103.103.31.103.412 0l3.402-3.402a.809.809 0 0 1 1.134 0c.104.412.104.824-.206 1.133Z");
    			attr_dev(path1, "fill", "#232323");
    			attr_dev(path1, "class", "svelte-1p19jg8");
    			add_location(path1, file$5, 56, 11, 2123);
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-1p19jg8");
    			add_location(svg1, file$5, 55, 8, 2016);
    			attr_dev(div1, "class", "svelte-1p19jg8");
    			add_location(div1, file$5, 54, 6, 1951);
    			attr_dev(span, "id", "inputWrap");
    			attr_dev(span, "class", "svelte-1p19jg8");
    			add_location(span, file$5, 44, 4, 991);
    			attr_dev(div2, "class", "inputGroup svelte-1p19jg8");
    			add_location(div2, file$5, 42, 2, 930);
    			attr_dev(div3, "class", "svelte-1p19jg8");
    			add_location(div3, file$5, 40, 0, 900);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(div2, t3);
    			append_dev(div2, span);
    			append_dev(span, input);
    			set_input_value(input, /*roundNumber*/ ctx[1]);
    			append_dev(span, t4);
    			append_dev(span, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(span, t5);
    			append_dev(span, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path1);
    			append_dev(div3, t6);
    			mount_component(button, div3, null);
    			append_dev(div3, t7);
    			mount_component(playerslist, div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleKeydown*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(div0, "click", /*numUp*/ ctx[3], false, false, false),
    					listen_dev(div1, "click", /*numDown*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*roundNumber*/ 2 && to_number(input.value) !== /*roundNumber*/ ctx[1]) {
    				set_input_value(input, /*roundNumber*/ ctx[1]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const playerslist_changes = {};
    			if (dirty & /*players*/ 1) playerslist_changes.players = /*players*/ ctx[0];
    			playerslist.$set(playerslist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fly, { x: 50 });
    					div0_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { x: 50, delay: 200 });
    					div1_intro.start();
    				});
    			}

    			transition_in(button.$$.fragment, local);
    			transition_in(playerslist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(playerslist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(button);
    			destroy_component(playerslist);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HostSettings', slots, []);
    	const dispatch = createEventDispatcher();
    	let roundTimerOn;
    	let { players } = $$props;
    	let roundNumber = 5;
    	let roundTimer = 60;

    	function handleKeydown(e) {
    		if (e.key === "ArrowUp") numUp();
    		if (e.key === "ArrowDown") numDown();
    	}

    	function numUp() {
    		if (roundNumber === 10) return;
    		$$invalidate(1, roundNumber = roundNumber + 1);
    	}

    	function numDown() {
    		if (roundNumber === 1) return;
    		$$invalidate(1, roundNumber = roundNumber - 1);
    	}

    	function startGame() {
    		dispatch("startGame", {
    			numberOfRounds: roundNumber,
    			roundTimer: roundTimerOn ? roundTimer : null
    		});
    	}

    	const writable_props = ['players'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HostSettings> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		roundNumber = to_number(this.value);
    		$$invalidate(1, roundNumber);
    	}

    	$$self.$$set = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		fly,
    		Button,
    		PlayersList,
    		roundTimerOn,
    		players,
    		roundNumber,
    		roundTimer,
    		handleKeydown,
    		numUp,
    		numDown,
    		startGame
    	});

    	$$self.$inject_state = $$props => {
    		if ('roundTimerOn' in $$props) roundTimerOn = $$props.roundTimerOn;
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    		if ('roundNumber' in $$props) $$invalidate(1, roundNumber = $$props.roundNumber);
    		if ('roundTimer' in $$props) roundTimer = $$props.roundTimer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		players,
    		roundNumber,
    		handleKeydown,
    		numUp,
    		numDown,
    		startGame,
    		input_input_handler
    	];
    }

    class HostSettings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { players: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HostSettings",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*players*/ ctx[0] === undefined && !('players' in props)) {
    			console.warn("<HostSettings> was created without expected prop 'players'");
    		}
    	}

    	get players() {
    		throw new Error("<HostSettings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<HostSettings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\Results.svelte generated by Svelte v3.47.0 */
    const file$4 = "src\\Game\\Results.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (12:4) {#if roundOutcome.won}
    function create_if_block$3(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t2;
    	let t3_value = /*roundOutcome*/ ctx[0].turns + "";
    	let t3;
    	let t4;
    	let section;
    	let each_value = { length: 5 };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Congrats!";
    			t1 = space();
    			p = element("p");
    			t2 = text("You got it in ");
    			t3 = text(t3_value);
    			t4 = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-wbaf3w");
    			add_location(h2, file$4, 12, 6, 301);
    			attr_dev(p, "class", "svelte-wbaf3w");
    			add_location(p, file$4, 13, 6, 327);
    			attr_dev(section, "class", "svelte-wbaf3w");
    			add_location(section, file$4, 14, 6, 376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*roundOutcome*/ 1 && t3_value !== (t3_value = /*roundOutcome*/ ctx[0].turns + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*roundOutcome*/ 1) {
    				each_value = { length: 5 };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(12:4) {#if roundOutcome.won}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#each { length: 5 } as _, i}
    function create_each_block$2(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");

    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(/*roundOutcome*/ ctx[0].turns > /*i*/ ctx[6] + 1
    			? "red"
    			: /*roundOutcome*/ ctx[0].turns < /*i*/ ctx[6] + 1
    				? ""
    				: "green") + " svelte-wbaf3w"));

    			add_location(span, file$4, 16, 10, 436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*roundOutcome*/ 1 && span_class_value !== (span_class_value = "" + (null_to_empty(/*roundOutcome*/ ctx[0].turns > /*i*/ ctx[6] + 1
    			? "red"
    			: /*roundOutcome*/ ctx[0].turns < /*i*/ ctx[6] + 1
    				? ""
    				: "green") + " svelte-wbaf3w"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(16:8) {#each { length: 5 } as _, i}",
    		ctx
    	});

    	return block;
    }

    // (23:4) <Button        style="margin-top"        func={() => {          dispatch("roundOver");        }}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Go to Leaderboard");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(23:4) <Button        style=\\\"margin-top\\\"        func={() => {          dispatch(\\\"roundOver\\\");        }}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let a;
    	let h2;
    	let t1_value = /*data*/ ctx[1].Title + "";
    	let t1;
    	let t2;
    	let t3_value = /*data*/ ctx[1].Year + "";
    	let t3;
    	let t4;
    	let a_href_value;
    	let t5;
    	let p;
    	let t6;
    	let t7_value = /*data*/ ctx[1].Director + "";
    	let t7;
    	let br0;
    	let t8;
    	let t9_value = /*data*/ ctx[1].Screenwriter + "";
    	let t9;
    	let br1;
    	let t10;
    	let t11_value = /*data*/ ctx[1].Starring + "";
    	let t11;
    	let t12;
    	let button;
    	let t13;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let current;
    	let if_block = /*roundOutcome*/ ctx[0].won && create_if_block$3(ctx);

    	button = new Button({
    			props: {
    				style: "margin-top",
    				func: /*func*/ ctx[3],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			a = element("a");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			p = element("p");
    			t6 = text("Directed by ");
    			t7 = text(t7_value);
    			br0 = element("br");
    			t8 = text(" Written by ");
    			t9 = text(t9_value);
    			br1 = element("br");
    			t10 = text("Starring ");
    			t11 = text(t11_value);
    			t12 = space();
    			create_component(button.$$.fragment);
    			t13 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(h2, "class", "svelte-wbaf3w");
    			add_location(h2, file$4, 20, 24, 603);
    			attr_dev(a, "href", a_href_value = /*data*/ ctx[1].IMDB);
    			attr_dev(a, "class", "svelte-wbaf3w");
    			add_location(a, file$4, 20, 4, 583);
    			add_location(br0, file$4, 21, 34, 678);
    			add_location(br1, file$4, 21, 71, 715);
    			attr_dev(p, "class", "svelte-wbaf3w");
    			add_location(p, file$4, 21, 4, 648);
    			attr_dev(div0, "id", "resultText");
    			attr_dev(div0, "class", "svelte-wbaf3w");
    			add_location(div0, file$4, 10, 2, 244);
    			attr_dev(img, "class", "fadeIn svelte-wbaf3w");
    			if (!src_url_equal(img.src, img_src_value = /*data*/ ctx[1].Poster)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*data*/ ctx[1].Title);
    			add_location(img, file$4, 29, 22, 918);
    			attr_dev(div1, "id", "resultImg");
    			attr_dev(div1, "class", "svelte-wbaf3w");
    			add_location(div1, file$4, 29, 2, 898);
    			attr_dev(div2, "id", "results");
    			attr_dev(div2, "class", "svelte-wbaf3w");
    			add_location(div2, file$4, 9, 0, 222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    			append_dev(a, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(p, br0);
    			append_dev(p, t8);
    			append_dev(p, t9);
    			append_dev(p, br1);
    			append_dev(p, t10);
    			append_dev(p, t11);
    			append_dev(div0, t12);
    			mount_component(button, div0, null);
    			append_dev(div2, t13);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*roundOutcome*/ ctx[0].won) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((!current || dirty & /*data*/ 2) && t1_value !== (t1_value = /*data*/ ctx[1].Title + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*data*/ 2) && t3_value !== (t3_value = /*data*/ ctx[1].Year + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*data*/ 2 && a_href_value !== (a_href_value = /*data*/ ctx[1].IMDB)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*data*/ 2) && t7_value !== (t7_value = /*data*/ ctx[1].Director + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*data*/ 2) && t9_value !== (t9_value = /*data*/ ctx[1].Screenwriter + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*data*/ 2) && t11_value !== (t11_value = /*data*/ ctx[1].Starring + "")) set_data_dev(t11, t11_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (!current || dirty & /*data*/ 2 && !src_url_equal(img.src, img_src_value = /*data*/ ctx[1].Poster)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*data*/ 2 && img_alt_value !== (img_alt_value = /*data*/ ctx[1].Title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Results', slots, []);
    	let { roundOutcome } = $$props;
    	let { data } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['roundOutcome', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Results> was created with unknown prop '${key}'`);
    	});

    	const func = () => {
    		dispatch("roundOver");
    	};

    	$$self.$$set = $$props => {
    		if ('roundOutcome' in $$props) $$invalidate(0, roundOutcome = $$props.roundOutcome);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		roundOutcome,
    		data,
    		Button,
    		createEventDispatcher,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('roundOutcome' in $$props) $$invalidate(0, roundOutcome = $$props.roundOutcome);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [roundOutcome, data, dispatch, func];
    }

    class Results extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { roundOutcome: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Results",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*roundOutcome*/ ctx[0] === undefined && !('roundOutcome' in props)) {
    			console.warn("<Results> was created without expected prop 'roundOutcome'");
    		}

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<Results> was created without expected prop 'data'");
    		}
    	}

    	get roundOutcome() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roundOutcome(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\FilmPicker.svelte generated by Svelte v3.47.0 */

    const { Object: Object_1$1, console: console_1$3 } = globals;
    const file$3 = "src\\Game\\FilmPicker.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (131:6) {#each { length: turn } as _, i}
    function create_each_block_2(ctx) {
    	let div;
    	let t0_value = /*i*/ ctx[28] + 1 + "";
    	let t0;
    	let t1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[20](/*i*/ ctx[28]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*currentImg*/ ctx[2] === /*i*/ ctx[28] + 1
    			? "selected"
    			: "") + " svelte-cru1bp"));

    			add_location(div, file$3, 131, 8, 3512);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*currentImg*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(/*currentImg*/ ctx[2] === /*i*/ ctx[28] + 1
    			? "selected"
    			: "") + " svelte-cru1bp"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(131:6) {#each { length: turn } as _, i}",
    		ctx
    	});

    	return block;
    }

    // (166:2) {:else}
    function create_else_block$1(ctx) {
    	let results;
    	let current;

    	results = new Results({
    			props: {
    				roundOutcome: /*roundOutcome*/ ctx[8],
    				data: /*filmThisRound*/ ctx[11]
    			},
    			$$inline: true
    		});

    	results.$on("roundOver", /*goToLeaderboard*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(results.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(results, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const results_changes = {};
    			if (dirty[0] & /*roundOutcome*/ 256) results_changes.roundOutcome = /*roundOutcome*/ ctx[8];
    			results.$set(results_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(results.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(results.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(results, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(166:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (143:2) {#if !roundOver}
    function create_if_block$2(ctx) {
    	let ul0;
    	let t0;
    	let div;
    	let input;
    	let t1;
    	let ul1;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*guesses*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*autoselect*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	button = new Button({
    			props: {
    				disabled: /*noGuess*/ ctx[9],
    				style: "wide",
    				func: /*addGuess*/ ctx[15],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div = element("div");
    			input = element("input");
    			t1 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(ul0, "id", "guessGrid");
    			attr_dev(ul0, "class", "svelte-cru1bp");
    			add_location(ul0, file$3, 143, 4, 3753);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-cru1bp");
    			add_location(input, file$3, 149, 6, 3936);
    			attr_dev(ul1, "id", "autoselect");
    			attr_dev(ul1, "class", "svelte-cru1bp");
    			add_location(ul1, file$3, 150, 6, 4014);
    			attr_dev(div, "id", "inputBox");
    			div.hidden = /*showSearch*/ ctx[6];
    			attr_dev(div, "class", "svelte-cru1bp");
    			add_location(div, file$3, 148, 4, 3889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*currentGuess*/ ctx[3]);
    			append_dev(div, t1);
    			append_dev(div, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[21]),
    					listen_dev(input, "input", /*handleInput*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*guesses*/ 16) {
    				each_value_1 = /*guesses*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*currentGuess*/ 8 && input.value !== /*currentGuess*/ ctx[3]) {
    				set_input_value(input, /*currentGuess*/ ctx[3]);
    			}

    			if (dirty[0] & /*autoselect, setGuess*/ 17408) {
    				each_value = /*autoselect*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*showSearch*/ 64) {
    				prop_dev(div, "hidden", /*showSearch*/ ctx[6]);
    			}

    			const button_changes = {};
    			if (dirty[0] & /*noGuess*/ 512) button_changes.disabled = /*noGuess*/ ctx[9];

    			if (dirty[0] & /*buttonText*/ 32 | dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(143:2) {#if !roundOver}",
    		ctx
    	});

    	return block;
    }

    // (145:6) {#each guesses as guess}
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*guess*/ ctx[29].text + "";
    	let t;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*guess*/ ctx[29].outcome) + " svelte-cru1bp"));
    			add_location(li, file$3, 145, 8, 3814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*guesses*/ 16 && t_value !== (t_value = /*guess*/ ctx[29].text + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*guesses*/ 16 && li_class_value !== (li_class_value = "" + (null_to_empty(/*guess*/ ctx[29].outcome) + " svelte-cru1bp"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(145:6) {#each guesses as guess}",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#each autoselect as auto, i}
    function create_each_block$1(ctx) {
    	let li;
    	let t0_value = /*auto*/ ctx[26] + "";
    	let t0;
    	let t1;
    	let li_name_value;
    	let li_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[22](/*auto*/ ctx[26]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "name", li_name_value = /*auto*/ ctx[26]);
    			attr_dev(li, "class", "svelte-cru1bp");
    			add_location(li, file$3, 152, 10, 4085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*autoselect*/ 1024) && t0_value !== (t0_value = /*auto*/ ctx[26] + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty[0] & /*autoselect*/ 1024 && li_name_value !== (li_name_value = /*auto*/ ctx[26])) {
    				attr_dev(li, "name", li_name_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(li, slide, { duration: 200 }, true);
    				li_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!li_transition) li_transition = create_bidirectional_transition(li, slide, { duration: 200 }, false);
    			li_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching && li_transition) li_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(152:8) {#each autoselect as auto, i}",
    		ctx
    	});

    	return block;
    }

    // (165:4) <Button disabled={noGuess} style="wide" func={addGuess}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*buttonText*/ ctx[5]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*buttonText*/ 32) set_data_dev(t, /*buttonText*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(165:4) <Button disabled={noGuess} style=\\\"wide\\\" func={addGuess}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let each_value_2 = { length: /*turn*/ ctx[1] };
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*roundOver*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if_block.c();
    			if (!src_url_equal(img.src, img_src_value = /*imgSRC*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*filmThisRound*/ ctx[11].id);
    			attr_dev(img, "class", "svelte-cru1bp");
    			add_location(img, file$3, 128, 4, 3392);
    			attr_dev(div0, "class", "numList svelte-cru1bp");
    			add_location(div0, file$3, 129, 4, 3441);
    			attr_dev(div1, "id", "topBox");
    			attr_dev(div1, "class", "svelte-cru1bp");
    			add_location(div1, file$3, 127, 2, 3369);
    			add_location(div2, file$3, 126, 0, 3360);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*imgSRC*/ 1 && !src_url_equal(img.src, img_src_value = /*imgSRC*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*currentImg, updateImg, turn*/ 8198) {
    				each_value_2 = { length: /*turn*/ ctx[1] };
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FilmPicker', slots, []);
    	const dispatch = createEventDispatcher();
    	let { roomData } = $$props;
    	let { filmData } = $$props;
    	let { filmNames } = $$props;
    	let imgSRC;
    	let turn = 1;
    	let currentImg = 1;
    	let currentGuess;
    	let guesses = [];
    	let buttonText = "Guess!";
    	let showSearch = false;
    	let roundOver = false;
    	let roundOutcome;
    	let noGuess = true;

    	for (let i = 0; i < 5; i++) {
    		guesses.push({ text: "", outcome: "blank" });
    	}

    	let autoselect = [];
    	console.log(roomData);
    	let roundIndex = roomData.currentRound - 1;

    	let filmThisRound = {
    		name: filmNames[roomData.films[roundIndex]],
    		id: roomData.films[roundIndex]
    	};

    	Object.assign(filmThisRound, filmData[filmThisRound.name]);
    	console.log(filmThisRound);

    	function setImage(num) {
    		if (num === undefined) return;

    		if (!filmThisRound[num]) {
    			console.log("Image missing!");
    			$$invalidate(0, imgSRC = "https://i1.wp.com/www.joshuacasper.com/contents/uploads/media-offline-adobe-media-encoder-fixed.jpg?ssl=1");
    			return;
    		}

    		$$invalidate(0, imgSRC = `${filmThisRound.prefix}${filmThisRound[num]}`);
    	}

    	setImage(turn - 1);

    	const handleInput = () => {
    		if (currentGuess === "" || currentGuess === " ") {
    			$$invalidate(9, noGuess = true);
    			$$invalidate(10, autoselect = []);
    			return;
    		}

    		$$invalidate(9, noGuess = false);
    		let barInput = currentGuess.toUpperCase();

    		for (let j = autoselect.length - 1; j >= 0; j--) {
    			if (!autoselect[j]) continue;
    			let word = autoselect[j];
    			console.log(autoselect);
    			console.log(`${j}:${word}, ${barInput}, ${word.includes(barInput)}`);
    			if (word.includes(barInput)) continue;
    			autoselect.splice(j, 1);
    			$$invalidate(10, autoselect);
    		}

    		console.log(autoselect);

    		//let newArray = [];
    		for (let i = 0; i < filmNames.length; i++) {
    			if (autoselect.includes(filmNames[i])) continue;

    			if (filmNames[i].includes(barInput)) {
    				$$invalidate(10, autoselect = [...autoselect, filmNames[i]]);
    				if (autoselect.length >= 6) break;
    			}
    		}
    	}; //autoselect = newArray;

    	function updateImg(i) {
    		console.log(`clicked: ${i}`);
    		console.log("WOW");
    		$$invalidate(2, currentImg = i + 1);
    		setImage(i);
    	}

    	function setGuess(data) {
    		$$invalidate(10, autoselect = []);
    		$$invalidate(3, currentGuess = data);
    	}

    	function addGuess() {
    		let guessTarget = guesses[turn - 1];
    		guessTarget.text = currentGuess;
    		$$invalidate(8, roundOutcome = { turns: turn, won: null });

    		if (currentGuess === filmThisRound.name) {
    			$$invalidate(7, roundOver = true);
    			$$invalidate(8, roundOutcome.won = true, roundOutcome);
    			updateImg(turn - 1);
    			$$invalidate(1, turn = 5);
    			$$invalidate(6, showSearch = true);
    			$$invalidate(3, currentGuess = "");
    			guessTarget.outcome = "correct";
    			$$invalidate(4, guesses);
    			$$invalidate(5, buttonText = "Correct!");
    			return;
    		}

    		$$invalidate(3, currentGuess = "");
    		guessTarget.outcome = "wrong";
    		$$invalidate(4, guesses);

    		if (guesses[4].outcome === "wrong") {
    			console.log("LOSE!");
    			$$invalidate(8, roundOutcome.won = false, roundOutcome);
    			$$invalidate(7, roundOver = true);
    			return;
    		}

    		updateImg(turn);
    		$$invalidate(1, turn = turn + 1);
    	}

    	function goToLeaderboard() {
    		dispatch("roundOver", roundOutcome);
    	}

    	const writable_props = ['roomData', 'filmData', 'filmNames'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<FilmPicker> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => {
    		updateImg(i);
    	};

    	function input_input_handler() {
    		currentGuess = this.value;
    		$$invalidate(3, currentGuess);
    	}

    	const click_handler_1 = auto => {
    		setGuess(auto);
    	};

    	$$self.$$set = $$props => {
    		if ('roomData' in $$props) $$invalidate(17, roomData = $$props.roomData);
    		if ('filmData' in $$props) $$invalidate(18, filmData = $$props.filmData);
    		if ('filmNames' in $$props) $$invalidate(19, filmNames = $$props.filmNames);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		slide,
    		Button,
    		Results,
    		roomData,
    		filmData,
    		filmNames,
    		imgSRC,
    		turn,
    		currentImg,
    		currentGuess,
    		guesses,
    		buttonText,
    		showSearch,
    		roundOver,
    		roundOutcome,
    		noGuess,
    		autoselect,
    		roundIndex,
    		filmThisRound,
    		setImage,
    		handleInput,
    		updateImg,
    		setGuess,
    		addGuess,
    		goToLeaderboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('roomData' in $$props) $$invalidate(17, roomData = $$props.roomData);
    		if ('filmData' in $$props) $$invalidate(18, filmData = $$props.filmData);
    		if ('filmNames' in $$props) $$invalidate(19, filmNames = $$props.filmNames);
    		if ('imgSRC' in $$props) $$invalidate(0, imgSRC = $$props.imgSRC);
    		if ('turn' in $$props) $$invalidate(1, turn = $$props.turn);
    		if ('currentImg' in $$props) $$invalidate(2, currentImg = $$props.currentImg);
    		if ('currentGuess' in $$props) $$invalidate(3, currentGuess = $$props.currentGuess);
    		if ('guesses' in $$props) $$invalidate(4, guesses = $$props.guesses);
    		if ('buttonText' in $$props) $$invalidate(5, buttonText = $$props.buttonText);
    		if ('showSearch' in $$props) $$invalidate(6, showSearch = $$props.showSearch);
    		if ('roundOver' in $$props) $$invalidate(7, roundOver = $$props.roundOver);
    		if ('roundOutcome' in $$props) $$invalidate(8, roundOutcome = $$props.roundOutcome);
    		if ('noGuess' in $$props) $$invalidate(9, noGuess = $$props.noGuess);
    		if ('autoselect' in $$props) $$invalidate(10, autoselect = $$props.autoselect);
    		if ('roundIndex' in $$props) roundIndex = $$props.roundIndex;
    		if ('filmThisRound' in $$props) $$invalidate(11, filmThisRound = $$props.filmThisRound);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		imgSRC,
    		turn,
    		currentImg,
    		currentGuess,
    		guesses,
    		buttonText,
    		showSearch,
    		roundOver,
    		roundOutcome,
    		noGuess,
    		autoselect,
    		filmThisRound,
    		handleInput,
    		updateImg,
    		setGuess,
    		addGuess,
    		goToLeaderboard,
    		roomData,
    		filmData,
    		filmNames,
    		click_handler,
    		input_input_handler,
    		click_handler_1
    	];
    }

    class FilmPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				roomData: 17,
    				filmData: 18,
    				filmNames: 19
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilmPicker",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*roomData*/ ctx[17] === undefined && !('roomData' in props)) {
    			console_1$3.warn("<FilmPicker> was created without expected prop 'roomData'");
    		}

    		if (/*filmData*/ ctx[18] === undefined && !('filmData' in props)) {
    			console_1$3.warn("<FilmPicker> was created without expected prop 'filmData'");
    		}

    		if (/*filmNames*/ ctx[19] === undefined && !('filmNames' in props)) {
    			console_1$3.warn("<FilmPicker> was created without expected prop 'filmNames'");
    		}
    	}

    	get roomData() {
    		throw new Error("<FilmPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roomData(value) {
    		throw new Error("<FilmPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filmData() {
    		throw new Error("<FilmPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filmData(value) {
    		throw new Error("<FilmPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filmNames() {
    		throw new Error("<FilmPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filmNames(value) {
    		throw new Error("<FilmPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Game\Leaderboard.svelte generated by Svelte v3.47.0 */

    const { console: console_1$2 } = globals;
    const file$2 = "src\\Game\\Leaderboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (28:2) {#if gameOver}
    function create_if_block_1$1(ctx) {
    	let h3;
    	let t0;
    	let t1_value = /*leaderboardData*/ ctx[0][0].username + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("Congrats ");
    			t1 = text(t1_value);
    			t2 = text("!");
    			add_location(h3, file$2, 28, 4, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leaderboardData*/ 1 && t1_value !== (t1_value = /*leaderboardData*/ ctx[0][0].username + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(28:2) {#if gameOver}",
    		ctx
    	});

    	return block;
    }

    // (32:4) {#each leaderboardData as dataPoint, i}
    function create_each_block(ctx) {
    	let span;
    	let b;
    	let t0_value = /*dataPoint*/ ctx[7].username + "";
    	let t0;
    	let t1;
    	let t2_value = /*dataPoint*/ ctx[7].points + "";
    	let t2;
    	let t3;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			t3 = text(" points");
    			add_location(b, file$2, 32, 19, 815);
    			attr_dev(span, "class", "svelte-qssiyu");
    			add_location(span, file$2, 32, 6, 802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, b);
    			append_dev(b, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leaderboardData*/ 1 && t0_value !== (t0_value = /*dataPoint*/ ctx[7].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*leaderboardData*/ 1 && t2_value !== (t2_value = /*dataPoint*/ ctx[7].points + "")) set_data_dev(t2, t2_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, {});
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:4) {#each leaderboardData as dataPoint, i}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if hosting}
    function create_if_block$1(ctx) {
    	let button;
    	let t;
    	let p;
    	let current;

    	button = new Button({
    			props: {
    				style: "margin-top",
    				disabled: /*gameOver*/ ctx[2],
    				func: /*leaveLeaderboard*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t = space();
    			p = element("p");
    			add_location(p, file$2, 37, 4, 1020);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, p, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*gameOver*/ 4) button_changes.disabled = /*gameOver*/ ctx[2];
    			if (dirty & /*leaveLeaderboard*/ 16) button_changes.func = /*leaveLeaderboard*/ ctx[4];

    			if (dirty & /*$$scope, buttonText*/ 1032) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(36:2) {#if hosting}",
    		ctx
    	});

    	return block;
    }

    // (37:4) <Button style="margin-top" disabled={gameOver} func={leaveLeaderboard}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*buttonText*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buttonText*/ 8) set_data_dev(t, /*buttonText*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(37:4) <Button style=\\\"margin-top\\\" disabled={gameOver} func={leaveLeaderboard}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let current;
    	let if_block0 = /*gameOver*/ ctx[2] && create_if_block_1$1(ctx);
    	let each_value = /*leaderboardData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block1 = /*hosting*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Leaderboard!";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file$2, 26, 2, 638);
    			attr_dev(div0, "class", "svelte-qssiyu");
    			add_location(div0, file$2, 30, 2, 744);
    			attr_dev(div1, "class", "svelte-qssiyu");
    			add_location(div1, file$2, 25, 0, 629);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*gameOver*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*leaderboardData*/ 1) {
    				each_value = /*leaderboardData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*hosting*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*hosting*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Leaderboard', slots, []);
    	let { leaderboardData = [{ username: "" }] } = $$props;
    	let { hosting } = $$props;
    	let { roomData } = $$props;
    	let { socket } = $$props;
    	let gameOver = false;
    	let buttonText = `On to Round ${roomData.currentRound + 1}`;

    	let leaveLeaderboard = () => {
    		socket.emit("next-round", "");
    	};

    	if (roomData.currentRound === roomData.numberOfRounds) {
    		gameOver = true;
    		buttonText = "Cheeky one more?";

    		leaveLeaderboard = () => {
    			location.reload();
    		};
    	}

    	console.log(roomData);
    	const writable_props = ['leaderboardData', 'hosting', 'roomData', 'socket'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Leaderboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leaderboardData' in $$props) $$invalidate(0, leaderboardData = $$props.leaderboardData);
    		if ('hosting' in $$props) $$invalidate(1, hosting = $$props.hosting);
    		if ('roomData' in $$props) $$invalidate(5, roomData = $$props.roomData);
    		if ('socket' in $$props) $$invalidate(6, socket = $$props.socket);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		leaderboardData,
    		hosting,
    		roomData,
    		socket,
    		gameOver,
    		buttonText,
    		leaveLeaderboard,
    		fly
    	});

    	$$self.$inject_state = $$props => {
    		if ('leaderboardData' in $$props) $$invalidate(0, leaderboardData = $$props.leaderboardData);
    		if ('hosting' in $$props) $$invalidate(1, hosting = $$props.hosting);
    		if ('roomData' in $$props) $$invalidate(5, roomData = $$props.roomData);
    		if ('socket' in $$props) $$invalidate(6, socket = $$props.socket);
    		if ('gameOver' in $$props) $$invalidate(2, gameOver = $$props.gameOver);
    		if ('buttonText' in $$props) $$invalidate(3, buttonText = $$props.buttonText);
    		if ('leaveLeaderboard' in $$props) $$invalidate(4, leaveLeaderboard = $$props.leaveLeaderboard);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		leaderboardData,
    		hosting,
    		gameOver,
    		buttonText,
    		leaveLeaderboard,
    		roomData,
    		socket
    	];
    }

    class Leaderboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			leaderboardData: 0,
    			hosting: 1,
    			roomData: 5,
    			socket: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leaderboard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hosting*/ ctx[1] === undefined && !('hosting' in props)) {
    			console_1$2.warn("<Leaderboard> was created without expected prop 'hosting'");
    		}

    		if (/*roomData*/ ctx[5] === undefined && !('roomData' in props)) {
    			console_1$2.warn("<Leaderboard> was created without expected prop 'roomData'");
    		}

    		if (/*socket*/ ctx[6] === undefined && !('socket' in props)) {
    			console_1$2.warn("<Leaderboard> was created without expected prop 'socket'");
    		}
    	}

    	get leaderboardData() {
    		throw new Error("<Leaderboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leaderboardData(value) {
    		throw new Error("<Leaderboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hosting() {
    		throw new Error("<Leaderboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hosting(value) {
    		throw new Error("<Leaderboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get roomData() {
    		throw new Error("<Leaderboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roomData(value) {
    		throw new Error("<Leaderboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get socket() {
    		throw new Error("<Leaderboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set socket(value) {
    		throw new Error("<Leaderboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var TAMPOPO={"0":"Tampopo_13.jpg","1":"Tampopo_31.jpg","2":"Tampopo_08.jpg","3":"Tampopo_12.jpg","4":"Tampopo_44.jpg",Title:"Tampopo",Year:"1985",Poster:"https://m.media-amazon.com/images/M/MV5BOTE5ZWY2MGEtYjA5ZS00YjdkLTk1MmMtNGFhMDRlNTkzNTRiXkEyXkFqcGdeQXVyMTIyNzY1NzM@._V1_.jpg",Director:"Jûzô Itami",Screenwriter:"Jûzô Itami",Starring:"Ken Watanabe, Nobuko Miyamoto",IMDB:"https://www.imdb.com/title/tt0078748",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"};var ALIEN={"0":"image039%20(1).jpg","1":"image007%20(1).jpg","2":"image010%20(1).jpg","3":"image018%20(1).jpg","4":"image019%20(1).jpg",Title:"Alien",Year:"1979",Poster:"https://m.media-amazon.com/images/M/MV5BOGQzZTBjMjQtOTVmMS00NGE5LWEyYmMtOGQ1ZGZjNmRkYjFhXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",Director:"Ridley Scott",Screenwriter:"Dan O'Bannon, Ronald Shusett",Starring:"Sigourney Weaver, Tom Skerritt, John Hurt",IMDB:"https://www.imdb.com/title/tt0092048",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"};var IT={"0":"it026.jpg","1":"it008.jpg","2":"it034.jpg","3":"it009.jpg","4":"it005.jpg",Title:"It",Year:"2017",Poster:"https://m.media-amazon.com/images/M/MV5BZDVkZmI0YzAtNzdjYi00ZjhhLWE1ODEtMWMzMWMzNDA0NmQ4XkEyXkFqcGdeQXVyNzYzODM3Mzg@._V1_FMjpg_UX1000_.jpg",Director:"Andy Muschietti",Screenwriter:"Chase Palmer, Cary Joji Fukunaga, Gary Dauberman",Starring:"Bill Skarsgård, Jaeden Martell, Sophia Lillis",IMDB:"https://www.imdb.com/title/tt1396484/",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"};var TWISTER={"0":"Twister_017.jpg","1":"Twister_021.jpg","2":"Twister_015.jpg","3":"Twister_032.jpg","4":"Twister_057.jpg",Title:"Twister",Year:"1996",Poster:"https://m.media-amazon.com/images/M/MV5BODExYTM0MzEtZGY2Yy00N2ExLTkwZjItNGYzYTRmMWZlOGEzXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg",Director:"Jan de Bont",Screenwriter:"Anne-Marie Martin, Micheal Crichton",Starring:"Helen Hunt, Bill Paxton, Cary Elwes",IMDB:"https://www.imdb.com/title/tt0117998",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"};var filmData = {"LAST NIGHT IN SOHO":{"0":"Last_Night_In_Soho_008.jpg","1":"Last_Night_In_Soho_025.jpg","2":"Last_Night_In_Soho_001.jpg","3":"Last_Night_In_Soho_026.jpg","4":"Last_Night_In_Soho_014.jpg",Title:"Last Night in Soho",Year:"2021",Poster:"https://m.media-amazon.com/images/M/MV5BZjgwZDIwY2MtNGZlNy00NGRlLWFmNTgtOTBkZThjMDUwMGJhXkEyXkFqcGdeQXVyMTEyMjM2NDc2._V1_.jpg",Director:"Edgar Wright",Screenwriter:"Edgar Wright, Krysty Wilson-Cairns",Starring:"Thomasin McKenzie, Anya Taylor-Joy, Matt Smith",IMDB:"https://www.imdb.com/title/tt9639470",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},TAMPOPO:TAMPOPO,ALIEN:ALIEN,"ME AND EARL AND THE DYING GIRL":{"0":"Me_and_Earl_035.jpg","1":"Me_and_Earl_062.jpg","2":"Me_and_Earl_042.jpg","3":"Me_and_Earl_016.jpg","4":"Me_and_Earl_028.jpg",Title:"Me and Earl and the Dying Girl",Year:"2015",Poster:"https://m.media-amazon.com/images/M/MV5BZTUwZTkxOGMtMmFjYS00MWU2LTk2YjAtNWUzMzAwODM0NzdiXkEyXkFqcGdeQXVyNTA3MTU2MjE@._V1_.jpg",Director:"Alfonso Gomez-Rejon",Screenwriter:"Jesse Andrews",Starring:"Thomas Mann, RJ Cyler, Olivia Cooke",IMDB:"https://www.imdb.com/title/tt2582496/",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},IT:IT,"THE LOST WORLD: JURASSIC PARK":{"0":"Jurassic_Park_The_Lost_World_002.jpg","1":"Jurassic_Park_The_Lost_World_048.jpg","2":"Jurassic_Park_The_Lost_World_030.jpg","3":"Jurassic_Park_The_Lost_World_025.jpg","4":"Jurassic_Park_The_Lost_World_060.jpg",Title:"The Lost World: Jurassic Park",Year:"1997",Poster:"https://m.media-amazon.com/images/M/MV5BMDFlMmM4Y2QtNDg1ZS00MWVlLTlmODgtZDdhYjY5YjdhN2M0XkEyXkFqcGdeQXVyNTI4MjkwNjA@._V1_.jpg",Director:"Steven Spielberg",Screenwriter:"David Koepp, Micheal Crichton",Starring:"Jeff Goldblum, Julianne Moore, Pete Postlethwaite",IMDB:"https://www.imdb.com/title/tt0119567",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},TWISTER:TWISTER,"THE PRESTIGE":{"0":"06%20(1139).jpg","1":"12%20(1163).jpg","2":"01%20(1140).jpg","3":"15%20(1163).jpg","4":"45%20(1142).jpg",Title:"The Prestige",Year:"2006",Poster:"https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_FMjpg_UX1000_.jpg",Director:"Christopher Nolan",Screenwriter:"Jonathan Nolan, Christopher Nolan",Starring:"Christian Bale, Hugh Jackman, Scarlett Johansson",IMDB:"https://www.imdb.com/title/tt0482571",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},"DAZED AND CONFUSED":{"0":"vlcsnap-2014-07-14-11h23m09s215.png","1":"vlcsnap-2014-07-14-11h51m25s68.png","2":"vlcsnap-2014-07-14-11h33m23s2.png","3":"vlcsnap-2014-07-14-11h29m36s27.png","4":"vlcsnap-2014-07-14-11h41m43s134.png",Title:"Dazed and Confused",Year:"1993",Poster:"https://m.media-amazon.com/images/M/MV5BMTM5MDY5MDQyOV5BMl5BanBnXkFtZTgwMzM3NzMxMDE@._V1_FMjpg_UX1000_.jpg",Director:"Richard Linklater",Screenwriter:"Richard Linklater",Starring:"Jason London, Wiley Wiggins, Matthew McConaughey",IMDB:"https://www.imdb.com/title/tt0106677/",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},"I, ROBOT":{"0":"iRobot_007.jpg","1":"iRobot_002.jpg","2":"iRobot_012.jpg","3":"iRobot_039.jpg","4":"iRobot_022.jpg",Title:"I, Robot",Year:"2004",Poster:"https://m.media-amazon.com/images/M/MV5BNmE1OWI2ZGItMDUyOS00MmU5LWE0MzUtYTQ0YzA1YTE5MGYxXkEyXkFqcGdeQXVyMDM5ODIyNw@@._V1_.jpg",Director:"Alex Proyas",Screenwriter:"Jeff Vintar, Akiva Goldsman",Starring:"Will Smith, Bridget Moynahan, Alan Tudyk",IMDB:"https://www.imdb.com/title/tt0343818/",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},"BATTLE ROYALE":{"0":"Battle_Royale_006.jpg","1":"Battle_Royale_016.jpg","2":"Battle_Royale_032.jpg","3":"Battle_Royale_034.jpg","4":"Battle_Royale_009.jpg",Title:"Battle Royale",Year:"2000",Poster:"https://m.media-amazon.com/images/M/MV5BMDc2MGYwYzAtNzE2Yi00YmU3LTkxMDUtODk2YjhiNDM5NDIyXkEyXkFqcGdeQXVyMTEwNDU1MzEy._V1_.jpg",Director:"Kinji Fukasaku",Screenwriter:"Kenta Fukasaku, Koushun Takami",Starring:"Tatsuya Fujiware, Aki Maeda, Takeshi Kitano",IMDB:"https://www.imdb.com/title/tt0266308/",prefix:"https://film-grab.com/wp-content/uploads/photo-gallery/"},"THE LORD OF THE RINGS: THE FELLOWSHIP OF THE RING":{"0":"2516.jpg","1":"8894.jpg","2":"1189.jpg","3":"7172.jpg","4":"12394.jpg",Title:"The Lord of the Rings: The Fellowship of the Ring",Year:"2001",Poster:"https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",Director:"Peter Jackson",Screenwriter:"Fran Walsh, Philippa Boyens, Peter Jackson",Starring:"Elijah Wood, Ian McKellen, Viggo Mortensen",IMDB:"https://www.imdb.com/title/tt0120737/",prefix:"https://i2.wp.com/caps.pictures/200/1-lotr-fellowship/full/lotr1-movie-screencaps.com-"}};

    /* src\Game.svelte generated by Svelte v3.47.0 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$1 = "src\\Game.svelte";

    // (90:2) {:else}
    function create_else_block_2(ctx) {
    	let introscreen;
    	let current;

    	introscreen = new IntroScreen({
    			props: { socket: /*socket*/ ctx[0] },
    			$$inline: true
    		});

    	introscreen.$on("boot", /*bootGame*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(introscreen.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(introscreen, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const introscreen_changes = {};
    			if (dirty & /*socket*/ 1) introscreen_changes.socket = /*socket*/ ctx[0];
    			introscreen.$set(introscreen_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(introscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(introscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(introscreen, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(90:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:23) 
    function create_if_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*hosting*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(84:23) ",
    		ctx
    	});

    	return block;
    }

    // (78:2) {#if gameRunning}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*leaderboardOn*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:2) {#if gameRunning}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {:else}
    function create_else_block_1(ctx) {
    	let lobby;
    	let current;

    	lobby = new Lobby({
    			props: { players: /*players*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(lobby.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lobby, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lobby_changes = {};
    			if (dirty & /*players*/ 128) lobby_changes.players = /*players*/ ctx[7];
    			lobby.$set(lobby_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lobby.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lobby.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lobby, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(87:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:4) {#if hosting}
    function create_if_block_3(ctx) {
    	let hostsettings;
    	let current;

    	hostsettings = new HostSettings({
    			props: { players: /*players*/ ctx[7] },
    			$$inline: true
    		});

    	hostsettings.$on("startGame", /*hostStarts*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(hostsettings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hostsettings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hostsettings_changes = {};
    			if (dirty & /*players*/ 128) hostsettings_changes.players = /*players*/ ctx[7];
    			hostsettings.$set(hostsettings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hostsettings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hostsettings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hostsettings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(85:4) {#if hosting}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {:else}
    function create_else_block(ctx) {
    	let filmpicker;
    	let current;

    	filmpicker = new FilmPicker({
    			props: {
    				roomData: /*roomData*/ ctx[5],
    				filmData,
    				filmNames: /*filmNames*/ ctx[8]
    			},
    			$$inline: true
    		});

    	filmpicker.$on("roundOver", /*showLeaderboard*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(filmpicker.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filmpicker, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filmpicker_changes = {};
    			if (dirty & /*roomData*/ 32) filmpicker_changes.roomData = /*roomData*/ ctx[5];
    			filmpicker.$set(filmpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filmpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filmpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filmpicker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(81:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#if leaderboardOn}
    function create_if_block_1(ctx) {
    	let leaderboard;
    	let current;

    	leaderboard = new Leaderboard({
    			props: {
    				socket: /*socket*/ ctx[0],
    				leaderboardData: /*leaderboardData*/ ctx[6],
    				hosting: /*hosting*/ ctx[4],
    				roomData: /*roomData*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(leaderboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(leaderboard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const leaderboard_changes = {};
    			if (dirty & /*socket*/ 1) leaderboard_changes.socket = /*socket*/ ctx[0];
    			if (dirty & /*leaderboardData*/ 64) leaderboard_changes.leaderboardData = /*leaderboardData*/ ctx[6];
    			if (dirty & /*hosting*/ 16) leaderboard_changes.hosting = /*hosting*/ ctx[4];
    			if (dirty & /*roomData*/ 32) leaderboard_changes.roomData = /*roomData*/ ctx[5];
    			leaderboard.$set(leaderboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leaderboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leaderboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(leaderboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(79:4) {#if leaderboardOn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let game;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*gameRunning*/ ctx[2]) return 0;
    		if (/*gameBooted*/ ctx[1]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			game = element("game");
    			if_block.c();
    			attr_dev(game, "class", "svelte-1lce1p2");
    			add_location(game, file$1, 76, 0, 2090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, game, anchor);
    			if_blocks[current_block_type_index].m(game, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(game, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(game);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getRandomInt(max) {
    	return Math.floor(Math.random() * max);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	const dispatch = createEventDispatcher();
    	let { socket } = $$props;
    	let filmNames = Object.keys(filmData);
    	let gameBooted = false;
    	let gameRunning = false;
    	let leaderboardOn = false;
    	let hosting;
    	let roomData;
    	let leaderboardData;
    	let { roomCode } = $$props;
    	let players = [];
    	console.log(filmData);

    	function generateFilms(rounds) {
    		let filmsChosen = [];

    		while (filmsChosen.length != rounds) {
    			let filmNum = getRandomInt(filmNames.length);
    			if (!filmsChosen.includes(filmNum)) filmsChosen.push(filmNum);
    		}

    		return filmsChosen;
    	}

    	socket.on("player-joined", users => {
    		console.log("Player joined room");
    		console.log(users);
    		$$invalidate(7, players = users);
    	});

    	function bootGame({ detail }) {
    		$$invalidate(1, gameBooted = true);
    		$$invalidate(12, roomCode = detail.room);
    		dispatch("roomCodeChange", detail);
    		$$invalidate(4, hosting = detail.host);
    		console.log(detail);
    	}

    	function hostStarts({ detail }) {
    		if (detail.numberOfRounds > filmNames.length) detail.numberOfRounds = filmNames.length;
    		let generated = generateFilms(detail.numberOfRounds);
    		detail.films = generated;
    		console.log(detail);
    		socket.emit("host-start", detail);
    	}

    	socket.on("round-start", data => {
    		$$invalidate(5, roomData = data);
    		$$invalidate(2, gameRunning = true);
    		$$invalidate(3, leaderboardOn = false);
    	});

    	socket.on("leaderboard-update", board => {
    		$$invalidate(6, leaderboardData = board);
    		console.log("Leaderboard Updated");
    		console.log(leaderboardData);
    	});

    	function showLeaderboard({ detail }) {
    		socket.emit("user-round", detail);
    		$$invalidate(3, leaderboardOn = true);
    	}

    	const writable_props = ['socket', 'roomCode'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('socket' in $$props) $$invalidate(0, socket = $$props.socket);
    		if ('roomCode' in $$props) $$invalidate(12, roomCode = $$props.roomCode);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		socket,
    		IntroScreen,
    		Lobby,
    		HostSettings,
    		FilmPicker,
    		Leaderboard,
    		filmData,
    		filmNames,
    		gameBooted,
    		gameRunning,
    		leaderboardOn,
    		hosting,
    		roomData,
    		leaderboardData,
    		roomCode,
    		players,
    		getRandomInt,
    		generateFilms,
    		bootGame,
    		hostStarts,
    		showLeaderboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('socket' in $$props) $$invalidate(0, socket = $$props.socket);
    		if ('filmNames' in $$props) $$invalidate(8, filmNames = $$props.filmNames);
    		if ('gameBooted' in $$props) $$invalidate(1, gameBooted = $$props.gameBooted);
    		if ('gameRunning' in $$props) $$invalidate(2, gameRunning = $$props.gameRunning);
    		if ('leaderboardOn' in $$props) $$invalidate(3, leaderboardOn = $$props.leaderboardOn);
    		if ('hosting' in $$props) $$invalidate(4, hosting = $$props.hosting);
    		if ('roomData' in $$props) $$invalidate(5, roomData = $$props.roomData);
    		if ('leaderboardData' in $$props) $$invalidate(6, leaderboardData = $$props.leaderboardData);
    		if ('roomCode' in $$props) $$invalidate(12, roomCode = $$props.roomCode);
    		if ('players' in $$props) $$invalidate(7, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		socket,
    		gameBooted,
    		gameRunning,
    		leaderboardOn,
    		hosting,
    		roomData,
    		leaderboardData,
    		players,
    		filmNames,
    		bootGame,
    		hostStarts,
    		showLeaderboard,
    		roomCode
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { socket: 0, roomCode: 12 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*socket*/ ctx[0] === undefined && !('socket' in props)) {
    			console_1$1.warn("<Game> was created without expected prop 'socket'");
    		}

    		if (/*roomCode*/ ctx[12] === undefined && !('roomCode' in props)) {
    			console_1$1.warn("<Game> was created without expected prop 'roomCode'");
    		}
    	}

    	get socket() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set socket(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get roomCode() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set roomCode(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const PACKET_TYPES = Object.create(null); // no Map = no polyfill
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    Object.keys(PACKET_TYPES).forEach(key => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = { type: "error", data: "parser error" };

    const withNativeBlob$1 = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            Object.prototype.toString.call(Blob) === "[object BlobConstructor]");
    const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
    // ArrayBuffer.isView method is not defined in IE10
    const isView$1 = obj => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj && obj.buffer instanceof ArrayBuffer;
    };
    const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (withNativeBlob$1 && data instanceof Blob) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(data, callback);
            }
        }
        else if (withNativeArrayBuffer$2 &&
            (data instanceof ArrayBuffer || isView$1(data))) {
            if (supportsBinary) {
                return callback(data);
            }
            else {
                return encodeBlobAsBase64(new Blob([data]), callback);
            }
        }
        // plain string
        return callback(PACKET_TYPES[type] + (data || ""));
    };
    const encodeBlobAsBase64 = (data, callback) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
            const content = fileReader.result.split(",")[1];
            callback("b" + content);
        };
        return fileReader.readAsDataURL(data);
    };

    /*
     * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    var lookup$1 = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (var i$1 = 0; i$1 < chars.length; i$1++) {
        lookup$1[chars.charCodeAt(i$1)] = i$1;
    }
    var decode$1 = function (base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup$1[base64.charCodeAt(i)];
            encoded2 = lookup$1[base64.charCodeAt(i + 1)];
            encoded3 = lookup$1[base64.charCodeAt(i + 2)];
            encoded4 = lookup$1[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
    const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== "string") {
            return {
                type: "message",
                data: mapBinary(encodedPacket, binaryType)
            };
        }
        const type = encodedPacket.charAt(0);
        if (type === "b") {
            return {
                type: "message",
                data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
            };
        }
        const packetType = PACKET_TYPES_REVERSE[type];
        if (!packetType) {
            return ERROR_PACKET;
        }
        return encodedPacket.length > 1
            ? {
                type: PACKET_TYPES_REVERSE[type],
                data: encodedPacket.substring(1)
            }
            : {
                type: PACKET_TYPES_REVERSE[type]
            };
    };
    const decodeBase64Packet = (data, binaryType) => {
        if (withNativeArrayBuffer$1) {
            const decoded = decode$1(data);
            return mapBinary(decoded, binaryType);
        }
        else {
            return { base64: true, data }; // fallback for old browsers
        }
    };
    const mapBinary = (data, binaryType) => {
        switch (binaryType) {
            case "blob":
                return data instanceof ArrayBuffer ? new Blob([data]) : data;
            case "arraybuffer":
            default:
                return data; // assuming the data is already an ArrayBuffer
        }
    };

    const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
    const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
            // force base64 encoding for binary packets
            encodePacket(packet, false, encodedPacket => {
                encodedPackets[i] = encodedPacket;
                if (++count === length) {
                    callback(encodedPackets.join(SEPARATOR));
                }
            });
        });
    };
    const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
            const decodedPacket = decodePacket(encodedPackets[i], binaryType);
            packets.push(decodedPacket);
            if (decodedPacket.type === "error") {
                break;
            }
        }
        return packets;
    };
    const protocol$1 = 4;

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }

    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
      }

      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    // alias used for reserved events (protected method)
    Emitter.prototype.emitReserved = Emitter.prototype.emit;

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };

    var globalThis$1 = (() => {
        if (typeof self !== "undefined") {
            return self;
        }
        else if (typeof window !== "undefined") {
            return window;
        }
        else {
            return Function("return this")();
        }
    })();

    function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
            if (obj.hasOwnProperty(k)) {
                acc[k] = obj[k];
            }
            return acc;
        }, {});
    }
    // Keep a reference to the real timeout functions so they can be used when overridden
    const NATIVE_SET_TIMEOUT = setTimeout;
    const NATIVE_CLEAR_TIMEOUT = clearTimeout;
    function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
            obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThis$1);
            obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThis$1);
        }
        else {
            obj.setTimeoutFn = setTimeout.bind(globalThis$1);
            obj.clearTimeoutFn = clearTimeout.bind(globalThis$1);
        }
    }
    // base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
    const BASE64_OVERHEAD = 1.33;
    // we could also have used `new Blob([obj]).size`, but it isn't supported in IE9
    function byteLength(obj) {
        if (typeof obj === "string") {
            return utf8Length(obj);
        }
        // arraybuffer or blob
        return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
    }
    function utf8Length(str) {
        let c = 0, length = 0;
        for (let i = 0, l = str.length; i < l; i++) {
            c = str.charCodeAt(i);
            if (c < 0x80) {
                length += 1;
            }
            else if (c < 0x800) {
                length += 2;
            }
            else if (c < 0xd800 || c >= 0xe000) {
                length += 3;
            }
            else {
                i++;
                length += 4;
            }
        }
        return length;
    }

    class TransportError extends Error {
        constructor(reason, description, context) {
            super(reason);
            this.description = description;
            this.context = context;
            this.type = "TransportError";
        }
    }
    class Transport extends Emitter {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */
        constructor(opts) {
            super();
            this.writable = false;
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.query = opts.query;
            this.readyState = "";
            this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} reason
         * @param description
         * @param context - the error context
         * @return {Transport} for chaining
         * @api protected
         */
        onError(reason, description, context) {
            super.emitReserved("error", new TransportError(reason, description, context));
            return this;
        }
        /**
         * Opens the transport.
         *
         * @api public
         */
        open() {
            if ("closed" === this.readyState || "" === this.readyState) {
                this.readyState = "opening";
                this.doOpen();
            }
            return this;
        }
        /**
         * Closes the transport.
         *
         * @api public
         */
        close() {
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.doClose();
                this.onClose();
            }
            return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api public
         */
        send(packets) {
            if ("open" === this.readyState) {
                this.write(packets);
            }
        }
        /**
         * Called upon open
         *
         * @api protected
         */
        onOpen() {
            this.readyState = "open";
            this.writable = true;
            super.emitReserved("open");
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @api protected
         */
        onData(data) {
            const packet = decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @api protected
         */
        onPacket(packet) {
            super.emitReserved("packet", packet);
        }
        /**
         * Called upon close.
         *
         * @api protected
         */
        onClose(details) {
            this.readyState = "closed";
            super.emitReserved("close", details);
        }
    }

    // imported from https://github.com/unshiftio/yeast
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''), length = 64, map = {};
    let seed = 0, i = 0, prev;
    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
        let encoded = '';
        do {
            encoded = alphabet[num % length] + encoded;
            num = Math.floor(num / length);
        } while (num > 0);
        return encoded;
    }
    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
        const now = encode$1(+new Date());
        if (now !== prev)
            return seed = 0, prev = now;
        return now + '.' + encode$1(seed++);
    }
    //
    // Map each character to its index.
    //
    for (; i < length; i++)
        map[alphabet[i]] = i;

    // imported from https://github.com/galkn/querystring
    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */
    function encode(obj) {
        let str = '';
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (str.length)
                    str += '&';
                str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
            }
        }
        return str;
    }
    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */
    function decode(qs) {
        let qry = {};
        let pairs = qs.split('&');
        for (let i = 0, l = pairs.length; i < l; i++) {
            let pair = pairs[i].split('=');
            qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
    }

    // imported from https://github.com/component/has-cors
    let value = false;
    try {
        value = typeof XMLHttpRequest !== 'undefined' &&
            'withCredentials' in new XMLHttpRequest();
    }
    catch (err) {
        // if XMLHttp support is disabled in IE then it will throw
        // when trying to create
    }
    const hasCORS = value;

    // browser shim for xmlhttprequest module
    function XMLHttpRequest$1 (opts) {
        const xdomain = opts.xdomain;
        // XMLHttpRequest can be disabled on IE
        try {
            if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                return new XMLHttpRequest();
            }
        }
        catch (e) { }
        if (!xdomain) {
            try {
                return new globalThis$1[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
            }
            catch (e) { }
        }
    }

    function empty() { }
    const hasXHR2 = (function () {
        const xhr = new XMLHttpRequest$1({
            xdomain: false
        });
        return null != xhr.responseType;
    })();
    class Polling extends Transport {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.polling = false;
            if (typeof location !== "undefined") {
                const isSSL = "https:" === location.protocol;
                let port = location.port;
                // some user agents have empty `location.port`
                if (!port) {
                    port = isSSL ? "443" : "80";
                }
                this.xd =
                    (typeof location !== "undefined" &&
                        opts.hostname !== location.hostname) ||
                        port !== opts.port;
                this.xs = opts.secure !== isSSL;
            }
            /**
             * XHR supports binary
             */
            const forceBase64 = opts && opts.forceBase64;
            this.supportsBinary = hasXHR2 && !forceBase64;
        }
        /**
         * Transport name.
         */
        get name() {
            return "polling";
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */
        doOpen() {
            this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */
        pause(onPause) {
            this.readyState = "pausing";
            const pause = () => {
                this.readyState = "paused";
                onPause();
            };
            if (this.polling || !this.writable) {
                let total = 0;
                if (this.polling) {
                    total++;
                    this.once("pollComplete", function () {
                        --total || pause();
                    });
                }
                if (!this.writable) {
                    total++;
                    this.once("drain", function () {
                        --total || pause();
                    });
                }
            }
            else {
                pause();
            }
        }
        /**
         * Starts polling cycle.
         *
         * @api public
         */
        poll() {
            this.polling = true;
            this.doPoll();
            this.emitReserved("poll");
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */
        onData(data) {
            const callback = packet => {
                // if its the first message we consider the transport open
                if ("opening" === this.readyState && packet.type === "open") {
                    this.onOpen();
                }
                // if its a close packet, we close the ongoing requests
                if ("close" === packet.type) {
                    this.onClose({ description: "transport closed by the server" });
                    return false;
                }
                // otherwise bypass onData and handle the message
                this.onPacket(packet);
            };
            // decode payload
            decodePayload(data, this.socket.binaryType).forEach(callback);
            // if an event did not trigger closing
            if ("closed" !== this.readyState) {
                // if we got data we're not polling
                this.polling = false;
                this.emitReserved("pollComplete");
                if ("open" === this.readyState) {
                    this.poll();
                }
            }
        }
        /**
         * For polling, send a close packet.
         *
         * @api private
         */
        doClose() {
            const close = () => {
                this.write([{ type: "close" }]);
            };
            if ("open" === this.readyState) {
                close();
            }
            else {
                // in case we're trying to close while
                // handshaking is in progress (GH-164)
                this.once("open", close);
            }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */
        write(packets) {
            this.writable = false;
            encodePayload(packets, data => {
                this.doWrite(data, () => {
                    this.writable = true;
                    this.emitReserved("drain");
                });
            });
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "https" : "http";
            let port = "";
            // cache busting is forced
            if (false !== this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            if (!this.supportsBinary && !query.sid) {
                query.b64 = 1;
            }
            // avoid port if default for schema
            if (this.opts.port &&
                (("https" === schema && Number(this.opts.port) !== 443) ||
                    ("http" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */
        request(opts = {}) {
            Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
            return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */
        doWrite(data, fn) {
            const req = this.request({
                method: "POST",
                data: data
            });
            req.on("success", fn);
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr post error", xhrStatus, context);
            });
        }
        /**
         * Starts a poll cycle.
         *
         * @api private
         */
        doPoll() {
            const req = this.request();
            req.on("data", this.onData.bind(this));
            req.on("error", (xhrStatus, context) => {
                this.onError("xhr poll error", xhrStatus, context);
            });
            this.pollXhr = req;
        }
    }
    class Request extends Emitter {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */
        constructor(uri, opts) {
            super();
            installTimerFunctions(this, opts);
            this.opts = opts;
            this.method = opts.method || "GET";
            this.uri = uri;
            this.async = false !== opts.async;
            this.data = undefined !== opts.data ? opts.data : null;
            this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */
        create() {
            const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
            opts.xdomain = !!this.opts.xd;
            opts.xscheme = !!this.opts.xs;
            const xhr = (this.xhr = new XMLHttpRequest$1(opts));
            try {
                xhr.open(this.method, this.uri, this.async);
                try {
                    if (this.opts.extraHeaders) {
                        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                        for (let i in this.opts.extraHeaders) {
                            if (this.opts.extraHeaders.hasOwnProperty(i)) {
                                xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                            }
                        }
                    }
                }
                catch (e) { }
                if ("POST" === this.method) {
                    try {
                        xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                    }
                    catch (e) { }
                }
                try {
                    xhr.setRequestHeader("Accept", "*/*");
                }
                catch (e) { }
                // ie6 check
                if ("withCredentials" in xhr) {
                    xhr.withCredentials = this.opts.withCredentials;
                }
                if (this.opts.requestTimeout) {
                    xhr.timeout = this.opts.requestTimeout;
                }
                xhr.onreadystatechange = () => {
                    if (4 !== xhr.readyState)
                        return;
                    if (200 === xhr.status || 1223 === xhr.status) {
                        this.onLoad();
                    }
                    else {
                        // make sure the `error` event handler that's user-set
                        // does not throw in the same tick and gets caught here
                        this.setTimeoutFn(() => {
                            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                        }, 0);
                    }
                };
                xhr.send(this.data);
            }
            catch (e) {
                // Need to defer since .create() is called directly from the constructor
                // and thus the 'error' event can only be only bound *after* this exception
                // occurs.  Therefore, also, we cannot throw here at all.
                this.setTimeoutFn(() => {
                    this.onError(e);
                }, 0);
                return;
            }
            if (typeof document !== "undefined") {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
            }
        }
        /**
         * Called upon error.
         *
         * @api private
         */
        onError(err) {
            this.emitReserved("error", err, this.xhr);
            this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @api private
         */
        cleanup(fromError) {
            if ("undefined" === typeof this.xhr || null === this.xhr) {
                return;
            }
            this.xhr.onreadystatechange = empty;
            if (fromError) {
                try {
                    this.xhr.abort();
                }
                catch (e) { }
            }
            if (typeof document !== "undefined") {
                delete Request.requests[this.index];
            }
            this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @api private
         */
        onLoad() {
            const data = this.xhr.responseText;
            if (data !== null) {
                this.emitReserved("data", data);
                this.emitReserved("success");
                this.cleanup();
            }
        }
        /**
         * Aborts the request.
         *
         * @api public
         */
        abort() {
            this.cleanup();
        }
    }
    Request.requestsCount = 0;
    Request.requests = {};
    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */
    if (typeof document !== "undefined") {
        // @ts-ignore
        if (typeof attachEvent === "function") {
            // @ts-ignore
            attachEvent("onunload", unloadHandler);
        }
        else if (typeof addEventListener === "function") {
            const terminationEvent = "onpagehide" in globalThis$1 ? "pagehide" : "unload";
            addEventListener(terminationEvent, unloadHandler, false);
        }
    }
    function unloadHandler() {
        for (let i in Request.requests) {
            if (Request.requests.hasOwnProperty(i)) {
                Request.requests[i].abort();
            }
        }
    }

    const nextTick = (() => {
        const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
        if (isPromiseAvailable) {
            return cb => Promise.resolve().then(cb);
        }
        else {
            return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
        }
    })();
    const WebSocket = globalThis$1.WebSocket || globalThis$1.MozWebSocket;
    const usingBrowserWebSocket = true;
    const defaultBinaryType = "arraybuffer";

    // detect ReactNative environment
    const isReactNative = typeof navigator !== "undefined" &&
        typeof navigator.product === "string" &&
        navigator.product.toLowerCase() === "reactnative";
    class WS extends Transport {
        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */
        constructor(opts) {
            super(opts);
            this.supportsBinary = !opts.forceBase64;
        }
        /**
         * Transport name.
         *
         * @api public
         */
        get name() {
            return "websocket";
        }
        /**
         * Opens socket.
         *
         * @api private
         */
        doOpen() {
            if (!this.check()) {
                // let probe timeout
                return;
            }
            const uri = this.uri();
            const protocols = this.opts.protocols;
            // React Native only supports the 'headers' option, and will print a warning if anything else is passed
            const opts = isReactNative
                ? {}
                : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
            if (this.opts.extraHeaders) {
                opts.headers = this.opts.extraHeaders;
            }
            try {
                this.ws =
                    usingBrowserWebSocket && !isReactNative
                        ? protocols
                            ? new WebSocket(uri, protocols)
                            : new WebSocket(uri)
                        : new WebSocket(uri, protocols, opts);
            }
            catch (err) {
                return this.emitReserved("error", err);
            }
            this.ws.binaryType = this.socket.binaryType || defaultBinaryType;
            this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @api private
         */
        addEventListeners() {
            this.ws.onopen = () => {
                if (this.opts.autoUnref) {
                    this.ws._socket.unref();
                }
                this.onOpen();
            };
            this.ws.onclose = closeEvent => this.onClose({
                description: "websocket connection closed",
                context: closeEvent
            });
            this.ws.onmessage = ev => this.onData(ev.data);
            this.ws.onerror = e => this.onError("websocket error", e);
        }
        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */
        write(packets) {
            this.writable = false;
            // encodePacket efficient as it uses WS framing
            // no need for encodePayload
            for (let i = 0; i < packets.length; i++) {
                const packet = packets[i];
                const lastPacket = i === packets.length - 1;
                encodePacket(packet, this.supportsBinary, data => {
                    // always create a new object (GH-437)
                    const opts = {};
                    // Sometimes the websocket has already been closed but the browser didn't
                    // have a chance of informing us about it yet, in that case send will
                    // throw an error
                    try {
                        if (usingBrowserWebSocket) {
                            // TypeError is thrown when passing the second argument on Safari
                            this.ws.send(data);
                        }
                    }
                    catch (e) {
                    }
                    if (lastPacket) {
                        // fake drain
                        // defer to next tick to allow Socket to clear writeBuffer
                        nextTick(() => {
                            this.writable = true;
                            this.emitReserved("drain");
                        }, this.setTimeoutFn);
                    }
                });
            }
        }
        /**
         * Closes socket.
         *
         * @api private
         */
        doClose() {
            if (typeof this.ws !== "undefined") {
                this.ws.close();
                this.ws = null;
            }
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
            let query = this.query || {};
            const schema = this.opts.secure ? "wss" : "ws";
            let port = "";
            // avoid port if default for schema
            if (this.opts.port &&
                (("wss" === schema && Number(this.opts.port) !== 443) ||
                    ("ws" === schema && Number(this.opts.port) !== 80))) {
                port = ":" + this.opts.port;
            }
            // append timestamp to URI
            if (this.opts.timestampRequests) {
                query[this.opts.timestampParam] = yeast();
            }
            // communicate binary support capabilities
            if (!this.supportsBinary) {
                query.b64 = 1;
            }
            const encodedQuery = encode(query);
            const ipv6 = this.opts.hostname.indexOf(":") !== -1;
            return (schema +
                "://" +
                (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) +
                port +
                this.opts.path +
                (encodedQuery.length ? "?" + encodedQuery : ""));
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */
        check() {
            return (!!WebSocket &&
                !("__initialize" in WebSocket && this.name === WS.prototype.name));
        }
    }

    const transports = {
        websocket: WS,
        polling: Polling
    };

    // imported from https://github.com/galkn/parseuri
    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */
    const re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    const parts = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];
    function parse(str) {
        const src = str, b = str.indexOf('['), e = str.indexOf(']');
        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }
        let m = re.exec(str || ''), uri = {}, i = 14;
        while (i--) {
            uri[parts[i]] = m[i] || '';
        }
        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }
        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);
        return uri;
    }
    function pathNames(obj, path) {
        const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
        if (path.substr(0, 1) == '/' || path.length === 0) {
            names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
            names.splice(names.length - 1, 1);
        }
        return names;
    }
    function queryKey(uri, query) {
        const data = {};
        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
            if ($1) {
                data[$1] = $2;
            }
        });
        return data;
    }

    class Socket$1 extends Emitter {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} opts - options
         * @api public
         */
        constructor(uri, opts = {}) {
            super();
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = null;
            }
            if (uri) {
                uri = parse(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol === "https" || uri.protocol === "wss";
                opts.port = uri.port;
                if (uri.query)
                    opts.query = uri.query;
            }
            else if (opts.host) {
                opts.hostname = parse(opts.host).host;
            }
            installTimerFunctions(this, opts);
            this.secure =
                null != opts.secure
                    ? opts.secure
                    : typeof location !== "undefined" && "https:" === location.protocol;
            if (opts.hostname && !opts.port) {
                // if no port is specified manually, use the protocol default
                opts.port = this.secure ? "443" : "80";
            }
            this.hostname =
                opts.hostname ||
                    (typeof location !== "undefined" ? location.hostname : "localhost");
            this.port =
                opts.port ||
                    (typeof location !== "undefined" && location.port
                        ? location.port
                        : this.secure
                            ? "443"
                            : "80");
            this.transports = opts.transports || ["polling", "websocket"];
            this.readyState = "";
            this.writeBuffer = [];
            this.prevBufferLen = 0;
            this.opts = Object.assign({
                path: "/engine.io",
                agent: false,
                withCredentials: false,
                upgrade: true,
                timestampParam: "t",
                rememberUpgrade: false,
                rejectUnauthorized: true,
                perMessageDeflate: {
                    threshold: 1024
                },
                transportOptions: {},
                closeOnBeforeunload: true
            }, opts);
            this.opts.path = this.opts.path.replace(/\/$/, "") + "/";
            if (typeof this.opts.query === "string") {
                this.opts.query = decode(this.opts.query);
            }
            // set on handshake
            this.id = null;
            this.upgrades = null;
            this.pingInterval = null;
            this.pingTimeout = null;
            // set on heartbeat
            this.pingTimeoutTimer = null;
            if (typeof addEventListener === "function") {
                if (this.opts.closeOnBeforeunload) {
                    // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                    // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                    // closed/reloaded)
                    addEventListener("beforeunload", () => {
                        if (this.transport) {
                            // silently close the transport
                            this.transport.removeAllListeners();
                            this.transport.close();
                        }
                    }, false);
                }
                if (this.hostname !== "localhost") {
                    this.offlineEventListener = () => {
                        this.onClose("transport close", {
                            description: "network connection lost"
                        });
                    };
                    addEventListener("offline", this.offlineEventListener, false);
                }
            }
            this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */
        createTransport(name) {
            const query = Object.assign({}, this.opts.query);
            // append engine.io protocol identifier
            query.EIO = protocol$1;
            // transport name
            query.transport = name;
            // session id if we already have one
            if (this.id)
                query.sid = this.id;
            const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
                query,
                socket: this,
                hostname: this.hostname,
                secure: this.secure,
                port: this.port
            });
            return new transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        open() {
            let transport;
            if (this.opts.rememberUpgrade &&
                Socket$1.priorWebsocketSuccess &&
                this.transports.indexOf("websocket") !== -1) {
                transport = "websocket";
            }
            else if (0 === this.transports.length) {
                // Emit error on next tick so it can be listened to
                this.setTimeoutFn(() => {
                    this.emitReserved("error", "No transports available");
                }, 0);
                return;
            }
            else {
                transport = this.transports[0];
            }
            this.readyState = "opening";
            // Retry with the next transport if the transport is disabled (jsonp: false)
            try {
                transport = this.createTransport(transport);
            }
            catch (e) {
                this.transports.shift();
                this.open();
                return;
            }
            transport.open();
            this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */
        setTransport(transport) {
            if (this.transport) {
                this.transport.removeAllListeners();
            }
            // set up transport
            this.transport = transport;
            // set up transport listeners
            transport
                .on("drain", this.onDrain.bind(this))
                .on("packet", this.onPacket.bind(this))
                .on("error", this.onError.bind(this))
                .on("close", reason => this.onClose("transport close", reason));
        }
        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */
        probe(name) {
            let transport = this.createTransport(name);
            let failed = false;
            Socket$1.priorWebsocketSuccess = false;
            const onTransportOpen = () => {
                if (failed)
                    return;
                transport.send([{ type: "ping", data: "probe" }]);
                transport.once("packet", msg => {
                    if (failed)
                        return;
                    if ("pong" === msg.type && "probe" === msg.data) {
                        this.upgrading = true;
                        this.emitReserved("upgrading", transport);
                        if (!transport)
                            return;
                        Socket$1.priorWebsocketSuccess = "websocket" === transport.name;
                        this.transport.pause(() => {
                            if (failed)
                                return;
                            if ("closed" === this.readyState)
                                return;
                            cleanup();
                            this.setTransport(transport);
                            transport.send([{ type: "upgrade" }]);
                            this.emitReserved("upgrade", transport);
                            transport = null;
                            this.upgrading = false;
                            this.flush();
                        });
                    }
                    else {
                        const err = new Error("probe error");
                        // @ts-ignore
                        err.transport = transport.name;
                        this.emitReserved("upgradeError", err);
                    }
                });
            };
            function freezeTransport() {
                if (failed)
                    return;
                // Any callback called by transport should be ignored since now
                failed = true;
                cleanup();
                transport.close();
                transport = null;
            }
            // Handle any error that happens while probing
            const onerror = err => {
                const error = new Error("probe error: " + err);
                // @ts-ignore
                error.transport = transport.name;
                freezeTransport();
                this.emitReserved("upgradeError", error);
            };
            function onTransportClose() {
                onerror("transport closed");
            }
            // When the socket is closed while we're probing
            function onclose() {
                onerror("socket closed");
            }
            // When the socket is upgraded while we're probing
            function onupgrade(to) {
                if (transport && to.name !== transport.name) {
                    freezeTransport();
                }
            }
            // Remove all listeners on the transport and on self
            const cleanup = () => {
                transport.removeListener("open", onTransportOpen);
                transport.removeListener("error", onerror);
                transport.removeListener("close", onTransportClose);
                this.off("close", onclose);
                this.off("upgrading", onupgrade);
            };
            transport.once("open", onTransportOpen);
            transport.once("error", onerror);
            transport.once("close", onTransportClose);
            this.once("close", onclose);
            this.once("upgrading", onupgrade);
            transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @api private
         */
        onOpen() {
            this.readyState = "open";
            Socket$1.priorWebsocketSuccess = "websocket" === this.transport.name;
            this.emitReserved("open");
            this.flush();
            // we check for `readyState` in case an `open`
            // listener already closed the socket
            if ("open" === this.readyState &&
                this.opts.upgrade &&
                this.transport.pause) {
                let i = 0;
                const l = this.upgrades.length;
                for (; i < l; i++) {
                    this.probe(this.upgrades[i]);
                }
            }
        }
        /**
         * Handles a packet.
         *
         * @api private
         */
        onPacket(packet) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                this.emitReserved("packet", packet);
                // Socket is live - any packet counts
                this.emitReserved("heartbeat");
                switch (packet.type) {
                    case "open":
                        this.onHandshake(JSON.parse(packet.data));
                        break;
                    case "ping":
                        this.resetPingTimeout();
                        this.sendPacket("pong");
                        this.emitReserved("ping");
                        this.emitReserved("pong");
                        break;
                    case "error":
                        const err = new Error("server error");
                        // @ts-ignore
                        err.code = packet.data;
                        this.onError(err);
                        break;
                    case "message":
                        this.emitReserved("data", packet.data);
                        this.emitReserved("message", packet.data);
                        break;
                }
            }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @api private
         */
        onHandshake(data) {
            this.emitReserved("handshake", data);
            this.id = data.sid;
            this.transport.query.sid = data.sid;
            this.upgrades = this.filterUpgrades(data.upgrades);
            this.pingInterval = data.pingInterval;
            this.pingTimeout = data.pingTimeout;
            this.maxPayload = data.maxPayload;
            this.onOpen();
            // In case open handler closes socket
            if ("closed" === this.readyState)
                return;
            this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @api private
         */
        resetPingTimeout() {
            this.clearTimeoutFn(this.pingTimeoutTimer);
            this.pingTimeoutTimer = this.setTimeoutFn(() => {
                this.onClose("ping timeout");
            }, this.pingInterval + this.pingTimeout);
            if (this.opts.autoUnref) {
                this.pingTimeoutTimer.unref();
            }
        }
        /**
         * Called on `drain` event
         *
         * @api private
         */
        onDrain() {
            this.writeBuffer.splice(0, this.prevBufferLen);
            // setting prevBufferLen = 0 is very important
            // for example, when upgrading, upgrade packet is sent over,
            // and a nonzero prevBufferLen could cause problems on `drain`
            this.prevBufferLen = 0;
            if (0 === this.writeBuffer.length) {
                this.emitReserved("drain");
            }
            else {
                this.flush();
            }
        }
        /**
         * Flush write buffers.
         *
         * @api private
         */
        flush() {
            if ("closed" !== this.readyState &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length) {
                const packets = this.getWritablePackets();
                this.transport.send(packets);
                // keep track of current length of writeBuffer
                // splice writeBuffer and callbackBuffer on `drain`
                this.prevBufferLen = packets.length;
                this.emitReserved("flush");
            }
        }
        /**
         * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
         * long-polling)
         *
         * @private
         */
        getWritablePackets() {
            const shouldCheckPayloadSize = this.maxPayload &&
                this.transport.name === "polling" &&
                this.writeBuffer.length > 1;
            if (!shouldCheckPayloadSize) {
                return this.writeBuffer;
            }
            let payloadSize = 1; // first packet type
            for (let i = 0; i < this.writeBuffer.length; i++) {
                const data = this.writeBuffer[i].data;
                if (data) {
                    payloadSize += byteLength(data);
                }
                if (i > 0 && payloadSize > this.maxPayload) {
                    return this.writeBuffer.slice(0, i);
                }
                payloadSize += 2; // separator + packet type
            }
            return this.writeBuffer;
        }
        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */
        write(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        send(msg, options, fn) {
            this.sendPacket("message", msg, options, fn);
            return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */
        sendPacket(type, data, options, fn) {
            if ("function" === typeof data) {
                fn = data;
                data = undefined;
            }
            if ("function" === typeof options) {
                fn = options;
                options = null;
            }
            if ("closing" === this.readyState || "closed" === this.readyState) {
                return;
            }
            options = options || {};
            options.compress = false !== options.compress;
            const packet = {
                type: type,
                data: data,
                options: options
            };
            this.emitReserved("packetCreate", packet);
            this.writeBuffer.push(packet);
            if (fn)
                this.once("flush", fn);
            this.flush();
        }
        /**
         * Closes the connection.
         *
         * @api public
         */
        close() {
            const close = () => {
                this.onClose("forced close");
                this.transport.close();
            };
            const cleanupAndClose = () => {
                this.off("upgrade", cleanupAndClose);
                this.off("upgradeError", cleanupAndClose);
                close();
            };
            const waitForUpgrade = () => {
                // wait for upgrade to finish since we can't send packets while pausing a transport
                this.once("upgrade", cleanupAndClose);
                this.once("upgradeError", cleanupAndClose);
            };
            if ("opening" === this.readyState || "open" === this.readyState) {
                this.readyState = "closing";
                if (this.writeBuffer.length) {
                    this.once("drain", () => {
                        if (this.upgrading) {
                            waitForUpgrade();
                        }
                        else {
                            close();
                        }
                    });
                }
                else if (this.upgrading) {
                    waitForUpgrade();
                }
                else {
                    close();
                }
            }
            return this;
        }
        /**
         * Called upon transport error
         *
         * @api private
         */
        onError(err) {
            Socket$1.priorWebsocketSuccess = false;
            this.emitReserved("error", err);
            this.onClose("transport error", err);
        }
        /**
         * Called upon transport close.
         *
         * @api private
         */
        onClose(reason, description) {
            if ("opening" === this.readyState ||
                "open" === this.readyState ||
                "closing" === this.readyState) {
                // clear timers
                this.clearTimeoutFn(this.pingTimeoutTimer);
                // stop event from firing again for transport
                this.transport.removeAllListeners("close");
                // ensure transport won't stay open
                this.transport.close();
                // ignore further transport communication
                this.transport.removeAllListeners();
                if (typeof removeEventListener === "function") {
                    removeEventListener("offline", this.offlineEventListener, false);
                }
                // set ready state
                this.readyState = "closed";
                // clear session id
                this.id = null;
                // emit close event
                this.emitReserved("close", reason, description);
                // clean buffers after, so users can still
                // grab the buffers on `close` event
                this.writeBuffer = [];
                this.prevBufferLen = 0;
            }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */
        filterUpgrades(upgrades) {
            const filteredUpgrades = [];
            let i = 0;
            const j = upgrades.length;
            for (; i < j; i++) {
                if (~this.transports.indexOf(upgrades[i]))
                    filteredUpgrades.push(upgrades[i]);
            }
            return filteredUpgrades;
        }
    }
    Socket$1.protocol = protocol$1;

    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    function url(uri, path = "", loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== "undefined" && location);
        if (null == uri)
            uri = loc.protocol + "//" + loc.host;
        // relative path support
        if (typeof uri === "string") {
            if ("/" === uri.charAt(0)) {
                if ("/" === uri.charAt(1)) {
                    uri = loc.protocol + uri;
                }
                else {
                    uri = loc.host + uri;
                }
            }
            if (!/^(https?|wss?):\/\//.test(uri)) {
                if ("undefined" !== typeof loc) {
                    uri = loc.protocol + "//" + uri;
                }
                else {
                    uri = "https://" + uri;
                }
            }
            // parse
            obj = parse(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
            if (/^(http|ws)$/.test(obj.protocol)) {
                obj.port = "80";
            }
            else if (/^(http|ws)s$/.test(obj.protocol)) {
                obj.port = "443";
            }
        }
        obj.path = obj.path || "/";
        const ipv6 = obj.host.indexOf(":") !== -1;
        const host = ipv6 ? "[" + obj.host + "]" : obj.host;
        // define unique id
        obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
        // define href
        obj.href =
            obj.protocol +
                "://" +
                host +
                (loc && loc.port === obj.port ? "" : ":" + obj.port);
        return obj;
    }

    const withNativeArrayBuffer = typeof ArrayBuffer === "function";
    const isView = (obj) => {
        return typeof ArrayBuffer.isView === "function"
            ? ArrayBuffer.isView(obj)
            : obj.buffer instanceof ArrayBuffer;
    };
    const toString = Object.prototype.toString;
    const withNativeBlob = typeof Blob === "function" ||
        (typeof Blob !== "undefined" &&
            toString.call(Blob) === "[object BlobConstructor]");
    const withNativeFile = typeof File === "function" ||
        (typeof File !== "undefined" &&
            toString.call(File) === "[object FileConstructor]");
    /**
     * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
     *
     * @private
     */
    function isBinary(obj) {
        return ((withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj))) ||
            (withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File));
    }
    function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== "object") {
            return false;
        }
        if (Array.isArray(obj)) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (hasBinary(obj[i])) {
                    return true;
                }
            }
            return false;
        }
        if (isBinary(obj)) {
            return true;
        }
        if (obj.toJSON &&
            typeof obj.toJSON === "function" &&
            arguments.length === 1) {
            return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @public
     */
    function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
    }
    function _deconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (isBinary(data)) {
            const placeholder = { _placeholder: true, num: buffers.length };
            buffers.push(data);
            return placeholder;
        }
        else if (Array.isArray(data)) {
            const newData = new Array(data.length);
            for (let i = 0; i < data.length; i++) {
                newData[i] = _deconstructPacket(data[i], buffers);
            }
            return newData;
        }
        else if (typeof data === "object" && !(data instanceof Date)) {
            const newData = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    newData[key] = _deconstructPacket(data[key], buffers);
                }
            }
            return newData;
        }
        return data;
    }
    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @public
     */
    function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        packet.attachments = undefined; // no longer useful
        return packet;
    }
    function _reconstructPacket(data, buffers) {
        if (!data)
            return data;
        if (data && data._placeholder) {
            return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        }
        else if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = _reconstructPacket(data[i], buffers);
            }
        }
        else if (typeof data === "object") {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    data[key] = _reconstructPacket(data[key], buffers);
                }
            }
        }
        return data;
    }

    /**
     * Protocol version.
     *
     * @public
     */
    const protocol = 5;
    var PacketType;
    (function (PacketType) {
        PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
        PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
        PacketType[PacketType["EVENT"] = 2] = "EVENT";
        PacketType[PacketType["ACK"] = 3] = "ACK";
        PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
        PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
        PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType || (PacketType = {}));
    /**
     * A socket.io Encoder instance
     */
    class Encoder {
        /**
         * Encoder constructor
         *
         * @param {function} replacer - custom replacer to pass down to JSON.parse
         */
        constructor(replacer) {
            this.replacer = replacer;
        }
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
            if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
                if (hasBinary(obj)) {
                    obj.type =
                        obj.type === PacketType.EVENT
                            ? PacketType.BINARY_EVENT
                            : PacketType.BINARY_ACK;
                    return this.encodeAsBinary(obj);
                }
            }
            return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
            // first is type
            let str = "" + obj.type;
            // attachments if we have them
            if (obj.type === PacketType.BINARY_EVENT ||
                obj.type === PacketType.BINARY_ACK) {
                str += obj.attachments + "-";
            }
            // if we have a namespace other than `/`
            // we append it followed by a comma `,`
            if (obj.nsp && "/" !== obj.nsp) {
                str += obj.nsp + ",";
            }
            // immediately followed by the id
            if (null != obj.id) {
                str += obj.id;
            }
            // json data
            if (null != obj.data) {
                str += JSON.stringify(obj.data, this.replacer);
            }
            return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
            const deconstruction = deconstructPacket(obj);
            const pack = this.encodeAsString(deconstruction.packet);
            const buffers = deconstruction.buffers;
            buffers.unshift(pack); // add packet info to beginning of data list
            return buffers; // write all the buffers
        }
    }
    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     */
    class Decoder extends Emitter {
        /**
         * Decoder constructor
         *
         * @param {function} reviver - custom reviver to pass down to JSON.stringify
         */
        constructor(reviver) {
            super();
            this.reviver = reviver;
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
            let packet;
            if (typeof obj === "string") {
                packet = this.decodeString(obj);
                if (packet.type === PacketType.BINARY_EVENT ||
                    packet.type === PacketType.BINARY_ACK) {
                    // binary packet's json
                    this.reconstructor = new BinaryReconstructor(packet);
                    // no attachments, labeled binary but no binary data to follow
                    if (packet.attachments === 0) {
                        super.emitReserved("decoded", packet);
                    }
                }
                else {
                    // non-binary full packet
                    super.emitReserved("decoded", packet);
                }
            }
            else if (isBinary(obj) || obj.base64) {
                // raw binary data
                if (!this.reconstructor) {
                    throw new Error("got binary data when not reconstructing a packet");
                }
                else {
                    packet = this.reconstructor.takeBinaryData(obj);
                    if (packet) {
                        // received final buffer
                        this.reconstructor = null;
                        super.emitReserved("decoded", packet);
                    }
                }
            }
            else {
                throw new Error("Unknown type: " + obj);
            }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
            let i = 0;
            // look up type
            const p = {
                type: Number(str.charAt(0)),
            };
            if (PacketType[p.type] === undefined) {
                throw new Error("unknown packet type " + p.type);
            }
            // look up attachments if type binary
            if (p.type === PacketType.BINARY_EVENT ||
                p.type === PacketType.BINARY_ACK) {
                const start = i + 1;
                while (str.charAt(++i) !== "-" && i != str.length) { }
                const buf = str.substring(start, i);
                if (buf != Number(buf) || str.charAt(i) !== "-") {
                    throw new Error("Illegal attachments");
                }
                p.attachments = Number(buf);
            }
            // look up namespace (if any)
            if ("/" === str.charAt(i + 1)) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if ("," === c)
                        break;
                    if (i === str.length)
                        break;
                }
                p.nsp = str.substring(start, i);
            }
            else {
                p.nsp = "/";
            }
            // look up id
            const next = str.charAt(i + 1);
            if ("" !== next && Number(next) == next) {
                const start = i + 1;
                while (++i) {
                    const c = str.charAt(i);
                    if (null == c || Number(c) != c) {
                        --i;
                        break;
                    }
                    if (i === str.length)
                        break;
                }
                p.id = Number(str.substring(start, i + 1));
            }
            // look up json data
            if (str.charAt(++i)) {
                const payload = this.tryParse(str.substr(i));
                if (Decoder.isPayloadValid(p.type, payload)) {
                    p.data = payload;
                }
                else {
                    throw new Error("invalid payload");
                }
            }
            return p;
        }
        tryParse(str) {
            try {
                return JSON.parse(str, this.reviver);
            }
            catch (e) {
                return false;
            }
        }
        static isPayloadValid(type, payload) {
            switch (type) {
                case PacketType.CONNECT:
                    return typeof payload === "object";
                case PacketType.DISCONNECT:
                    return payload === undefined;
                case PacketType.CONNECT_ERROR:
                    return typeof payload === "string" || typeof payload === "object";
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    return Array.isArray(payload) && payload.length > 0;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    return Array.isArray(payload);
            }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
            if (this.reconstructor) {
                this.reconstructor.finishedReconstruction();
            }
        }
    }
    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     */
    class BinaryReconstructor {
        constructor(packet) {
            this.packet = packet;
            this.buffers = [];
            this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
            this.buffers.push(binData);
            if (this.buffers.length === this.reconPack.attachments) {
                // done with buffer list
                const packet = reconstructPacket(this.reconPack, this.buffers);
                this.finishedReconstruction();
                return packet;
            }
            return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
            this.reconPack = null;
            this.buffers = [];
        }
    }

    var parser = /*#__PURE__*/Object.freeze({
        __proto__: null,
        protocol: protocol,
        get PacketType () { return PacketType; },
        Encoder: Encoder,
        Decoder: Decoder
    });

    function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
            obj.off(ev, fn);
        };
    }

    /**
     * Internal events.
     * These events can't be emitted by the user.
     */
    const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
    });
    class Socket extends Emitter {
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io, nsp, opts) {
            super();
            this.connected = false;
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.ids = 0;
            this.acks = {};
            this.flags = {};
            this.io = io;
            this.nsp = nsp;
            if (opts && opts.auth) {
                this.auth = opts.auth;
            }
            if (this.io._autoConnect)
                this.open();
        }
        /**
         * Whether the socket is currently disconnected
         */
        get disconnected() {
            return !this.connected;
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
            if (this.subs)
                return;
            const io = this.io;
            this.subs = [
                on(io, "open", this.onopen.bind(this)),
                on(io, "packet", this.onpacket.bind(this)),
                on(io, "error", this.onerror.bind(this)),
                on(io, "close", this.onclose.bind(this)),
            ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active() {
            return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect() {
            if (this.connected)
                return this;
            this.subEvents();
            if (!this.io["_reconnecting"])
                this.io.open(); // ensure open
            if ("open" === this.io._readyState)
                this.onopen();
            return this;
        }
        /**
         * Alias for connect()
         */
        open() {
            return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args) {
            args.unshift("message");
            this.emit.apply(this, args);
            return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @return self
         * @public
         */
        emit(ev, ...args) {
            if (RESERVED_EVENTS.hasOwnProperty(ev)) {
                throw new Error('"' + ev + '" is a reserved event name');
            }
            args.unshift(ev);
            const packet = {
                type: PacketType.EVENT,
                data: args,
            };
            packet.options = {};
            packet.options.compress = this.flags.compress !== false;
            // event ack callback
            if ("function" === typeof args[args.length - 1]) {
                const id = this.ids++;
                const ack = args.pop();
                this._registerAckCallback(id, ack);
                packet.id = id;
            }
            const isTransportWritable = this.io.engine &&
                this.io.engine.transport &&
                this.io.engine.transport.writable;
            const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
            if (discardPacket) ;
            else if (this.connected) {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            }
            else {
                this.sendBuffer.push(packet);
            }
            this.flags = {};
            return this;
        }
        /**
         * @private
         */
        _registerAckCallback(id, ack) {
            const timeout = this.flags.timeout;
            if (timeout === undefined) {
                this.acks[id] = ack;
                return;
            }
            // @ts-ignore
            const timer = this.io.setTimeoutFn(() => {
                delete this.acks[id];
                for (let i = 0; i < this.sendBuffer.length; i++) {
                    if (this.sendBuffer[i].id === id) {
                        this.sendBuffer.splice(i, 1);
                    }
                }
                ack.call(this, new Error("operation has timed out"));
            }, timeout);
            this.acks[id] = (...args) => {
                // @ts-ignore
                this.io.clearTimeoutFn(timer);
                ack.apply(this, [null, ...args]);
            };
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
            packet.nsp = this.nsp;
            this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
            if (typeof this.auth == "function") {
                this.auth((data) => {
                    this.packet({ type: PacketType.CONNECT, data });
                });
            }
            else {
                this.packet({ type: PacketType.CONNECT, data: this.auth });
            }
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
            if (!this.connected) {
                this.emitReserved("connect_error", err);
            }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @param description
         * @private
         */
        onclose(reason, description) {
            this.connected = false;
            delete this.id;
            this.emitReserved("disconnect", reason, description);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
            const sameNamespace = packet.nsp === this.nsp;
            if (!sameNamespace)
                return;
            switch (packet.type) {
                case PacketType.CONNECT:
                    if (packet.data && packet.data.sid) {
                        const id = packet.data.sid;
                        this.onconnect(id);
                    }
                    else {
                        this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                    }
                    break;
                case PacketType.EVENT:
                case PacketType.BINARY_EVENT:
                    this.onevent(packet);
                    break;
                case PacketType.ACK:
                case PacketType.BINARY_ACK:
                    this.onack(packet);
                    break;
                case PacketType.DISCONNECT:
                    this.ondisconnect();
                    break;
                case PacketType.CONNECT_ERROR:
                    this.destroy();
                    const err = new Error(packet.data.message);
                    // @ts-ignore
                    err.data = packet.data.data;
                    this.emitReserved("connect_error", err);
                    break;
            }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
            const args = packet.data || [];
            if (null != packet.id) {
                args.push(this.ack(packet.id));
            }
            if (this.connected) {
                this.emitEvent(args);
            }
            else {
                this.receiveBuffer.push(Object.freeze(args));
            }
        }
        emitEvent(args) {
            if (this._anyListeners && this._anyListeners.length) {
                const listeners = this._anyListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, args);
                }
            }
            super.emit.apply(this, args);
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
            const self = this;
            let sent = false;
            return function (...args) {
                // prevent double callbacks
                if (sent)
                    return;
                sent = true;
                self.packet({
                    type: PacketType.ACK,
                    id: id,
                    data: args,
                });
            };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
            const ack = this.acks[packet.id];
            if ("function" === typeof ack) {
                ack.apply(this, packet.data);
                delete this.acks[packet.id];
            }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id) {
            this.id = id;
            this.connected = true;
            this.emitBuffered();
            this.emitReserved("connect");
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
            this.receiveBuffer.forEach((args) => this.emitEvent(args));
            this.receiveBuffer = [];
            this.sendBuffer.forEach((packet) => {
                this.notifyOutgoingListeners(packet);
                this.packet(packet);
            });
            this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
            this.destroy();
            this.onclose("io server disconnect");
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
            if (this.subs) {
                // clean subscriptions to avoid reconnections
                this.subs.forEach((subDestroy) => subDestroy());
                this.subs = undefined;
            }
            this.io["_destroy"](this);
        }
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect() {
            if (this.connected) {
                this.packet({ type: PacketType.DISCONNECT });
            }
            // remove socket from pool
            this.destroy();
            if (this.connected) {
                // fire events
                this.onclose("io client disconnect");
            }
            return this;
        }
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close() {
            return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress) {
            this.flags.compress = compress;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile() {
            this.flags.volatile = true;
            return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
         * given number of milliseconds have elapsed without an acknowledgement from the server:
         *
         * ```
         * socket.timeout(5000).emit("my-event", (err) => {
         *   if (err) {
         *     // the server did not acknowledge the event in the given delay
         *   }
         * });
         * ```
         *
         * @returns self
         * @public
         */
        timeout(timeout) {
            this.flags.timeout = timeout;
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener) {
            this._anyListeners = this._anyListeners || [];
            this._anyListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener) {
            if (!this._anyListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny() {
            return this._anyListeners || [];
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.onAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        onAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.push(listener);
            return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         *
         * <pre><code>
         *
         * socket.prependAnyOutgoing((event, ...args) => {
         *   console.log(event);
         * });
         *
         * </pre></code>
         *
         * @public
         */
        prependAnyOutgoing(listener) {
            this._anyOutgoingListeners = this._anyOutgoingListeners || [];
            this._anyOutgoingListeners.unshift(listener);
            return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         *
         * <pre><code>
         *
         * const handler = (event, ...args) => {
         *   console.log(event);
         * }
         *
         * socket.onAnyOutgoing(handler);
         *
         * // then later
         * socket.offAnyOutgoing(handler);
         *
         * </pre></code>
         *
         * @public
         */
        offAnyOutgoing(listener) {
            if (!this._anyOutgoingListeners) {
                return this;
            }
            if (listener) {
                const listeners = this._anyOutgoingListeners;
                for (let i = 0; i < listeners.length; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                this._anyOutgoingListeners = [];
            }
            return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAnyOutgoing() {
            return this._anyOutgoingListeners || [];
        }
        /**
         * Notify the listeners for each packet sent
         *
         * @param packet
         *
         * @private
         */
        notifyOutgoingListeners(packet) {
            if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
                const listeners = this._anyOutgoingListeners.slice();
                for (const listener of listeners) {
                    listener.apply(this, packet.data);
                }
            }
        }
    }

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */
    function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
    }
    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */
    Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
            var rand = Math.random();
            var deviation = Math.floor(rand * this.jitter * ms);
            ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
    };
    /**
     * Reset the number of attempts.
     *
     * @api public
     */
    Backoff.prototype.reset = function () {
        this.attempts = 0;
    };
    /**
     * Set the minimum duration
     *
     * @api public
     */
    Backoff.prototype.setMin = function (min) {
        this.ms = min;
    };
    /**
     * Set the maximum duration
     *
     * @api public
     */
    Backoff.prototype.setMax = function (max) {
        this.max = max;
    };
    /**
     * Set the jitter
     *
     * @api public
     */
    Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
    };

    class Manager extends Emitter {
        constructor(uri, opts) {
            var _a;
            super();
            this.nsps = {};
            this.subs = [];
            if (uri && "object" === typeof uri) {
                opts = uri;
                uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || "/socket.io";
            this.opts = opts;
            installTimerFunctions(this, opts);
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1000);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
            this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
            this.backoff = new Backoff({
                min: this.reconnectionDelay(),
                max: this.reconnectionDelayMax(),
                jitter: this.randomizationFactor(),
            });
            this.timeout(null == opts.timeout ? 20000 : opts.timeout);
            this._readyState = "closed";
            this.uri = uri;
            const _parser = opts.parser || parser;
            this.encoder = new _parser.Encoder();
            this.decoder = new _parser.Decoder();
            this._autoConnect = opts.autoConnect !== false;
            if (this._autoConnect)
                this.open();
        }
        reconnection(v) {
            if (!arguments.length)
                return this._reconnection;
            this._reconnection = !!v;
            return this;
        }
        reconnectionAttempts(v) {
            if (v === undefined)
                return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
        }
        reconnectionDelay(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelay;
            this._reconnectionDelay = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
            return this;
        }
        randomizationFactor(v) {
            var _a;
            if (v === undefined)
                return this._randomizationFactor;
            this._randomizationFactor = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
            return this;
        }
        reconnectionDelayMax(v) {
            var _a;
            if (v === undefined)
                return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
            return this;
        }
        timeout(v) {
            if (!arguments.length)
                return this._timeout;
            this._timeout = v;
            return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
            // Only try to reconnect if it's the first time we're connecting
            if (!this._reconnecting &&
                this._reconnection &&
                this.backoff.attempts === 0) {
                // keeps reconnection from firing twice for the same reconnection loop
                this.reconnect();
            }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
            if (~this._readyState.indexOf("open"))
                return this;
            this.engine = new Socket$1(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this._readyState = "opening";
            this.skipReconnect = false;
            // emit `open`
            const openSubDestroy = on(socket, "open", function () {
                self.onopen();
                fn && fn();
            });
            // emit `error`
            const errorSub = on(socket, "error", (err) => {
                self.cleanup();
                self._readyState = "closed";
                this.emitReserved("error", err);
                if (fn) {
                    fn(err);
                }
                else {
                    // Only do this if there is no fn to handle the error
                    self.maybeReconnectOnOpen();
                }
            });
            if (false !== this._timeout) {
                const timeout = this._timeout;
                if (timeout === 0) {
                    openSubDestroy(); // prevents a race condition with the 'open' event
                }
                // set timer
                const timer = this.setTimeoutFn(() => {
                    openSubDestroy();
                    socket.close();
                    // @ts-ignore
                    socket.emit("error", new Error("timeout"));
                }, timeout);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
            this.subs.push(openSubDestroy);
            this.subs.push(errorSub);
            return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
            return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
            // clear old subs
            this.cleanup();
            // mark as open
            this._readyState = "open";
            this.emitReserved("open");
            // add new subs
            const socket = this.engine;
            this.subs.push(on(socket, "ping", this.onping.bind(this)), on(socket, "data", this.ondata.bind(this)), on(socket, "error", this.onerror.bind(this)), on(socket, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
            this.emitReserved("ping");
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
            this.decoder.add(data);
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
            this.emitReserved("packet", packet);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
            this.emitReserved("error", err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
            let socket = this.nsps[nsp];
            if (!socket) {
                socket = new Socket(this, nsp, opts);
                this.nsps[nsp] = socket;
            }
            return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
            const nsps = Object.keys(this.nsps);
            for (const nsp of nsps) {
                const socket = this.nsps[nsp];
                if (socket.active) {
                    return;
                }
            }
            this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
            const encodedPackets = this.encoder.encode(packet);
            for (let i = 0; i < encodedPackets.length; i++) {
                this.engine.write(encodedPackets[i], packet.options);
            }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs.length = 0;
            this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
            this.skipReconnect = true;
            this._reconnecting = false;
            this.onclose("forced close");
            if (this.engine)
                this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
            return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason, description) {
            this.cleanup();
            this.backoff.reset();
            this._readyState = "closed";
            this.emitReserved("close", reason, description);
            if (this._reconnection && !this.skipReconnect) {
                this.reconnect();
            }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
            if (this._reconnecting || this.skipReconnect)
                return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
                this.backoff.reset();
                this.emitReserved("reconnect_failed");
                this._reconnecting = false;
            }
            else {
                const delay = this.backoff.duration();
                this._reconnecting = true;
                const timer = this.setTimeoutFn(() => {
                    if (self.skipReconnect)
                        return;
                    this.emitReserved("reconnect_attempt", self.backoff.attempts);
                    // check again for the case socket closed in above events
                    if (self.skipReconnect)
                        return;
                    self.open((err) => {
                        if (err) {
                            self._reconnecting = false;
                            self.reconnect();
                            this.emitReserved("reconnect_error", err);
                        }
                        else {
                            self.onreconnect();
                        }
                    });
                }, delay);
                if (this.opts.autoUnref) {
                    timer.unref();
                }
                this.subs.push(function subDestroy() {
                    clearTimeout(timer);
                });
            }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
            const attempt = this.backoff.attempts;
            this._reconnecting = false;
            this.backoff.reset();
            this.emitReserved("reconnect", attempt);
        }
    }

    /**
     * Managers cache.
     */
    const cache = {};
    function lookup(uri, opts) {
        if (typeof uri === "object") {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        const parsed = url(uri, opts.path || "/socket.io");
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]["nsps"];
        const newConnection = opts.forceNew ||
            opts["force new connection"] ||
            false === opts.multiplex ||
            sameNamespace;
        let io;
        if (newConnection) {
            io = new Manager(source, opts);
        }
        else {
            if (!cache[id]) {
                cache[id] = new Manager(source, opts);
            }
            io = cache[id];
        }
        if (parsed.query && !opts.query) {
            opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
    }
    // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
    // namespace (e.g. `io.connect(...)`), for backward compatibility
    Object.assign(lookup, {
        Manager,
        Socket,
        io: lookup,
        connect: lookup,
    });

    /* src\App.svelte generated by Svelte v3.47.0 */

    const { Error: Error_1, console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (41:2) {:catch error}
    function create_catch_block(ctx) {
    	let error;
    	let current;

    	error = new Error$1({
    			props: { msg: /*error*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(41:2) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {:then value}
    function create_then_block(ctx) {
    	let game;
    	let updating_roomCode;
    	let current;

    	function game_roomCode_binding(value) {
    		/*game_roomCode_binding*/ ctx[5](value);
    	}

    	let game_props = { socket: /*socket*/ ctx[0] };

    	if (/*roomCode*/ ctx[2] !== void 0) {
    		game_props.roomCode = /*roomCode*/ ctx[2];
    	}

    	game = new Game({ props: game_props, $$inline: true });
    	binding_callbacks.push(() => bind(game, 'roomCode', game_roomCode_binding));
    	game.$on("roomCodeChange", /*updateRoomCode*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const game_changes = {};
    			if (dirty & /*socket*/ 1) game_changes.socket = /*socket*/ ctx[0];

    			if (!updating_roomCode && dirty & /*roomCode*/ 4) {
    				updating_roomCode = true;
    				game_changes.roomCode = /*roomCode*/ ctx[2];
    				add_flush_callback(() => updating_roomCode = false);
    			}

    			game.$set(game_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(39:2) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (37:22)       <p>Waiting!</p>    {:then value}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Waiting!";
    			add_location(p, file, 37, 4, 981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(37:22)       <p>Waiting!</p>    {:then value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let banner;
    	let t;
    	let current;

    	banner = new Banner({
    			props: {
    				host: /*host*/ ctx[1],
    				roomCode: /*roomCode*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 9,
    		error: 10,
    		blocks: [,,,]
    	};

    	handle_promise(/*socketStart*/ ctx[3], info);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(banner.$$.fragment);
    			t = space();
    			info.block.c();
    			attr_dev(main, "class", "svelte-gcdlys");
    			add_location(main, file, 34, 0, 913);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(banner, main, null);
    			append_dev(main, t);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const banner_changes = {};
    			if (dirty & /*host*/ 2) banner_changes.host = /*host*/ ctx[1];
    			if (dirty & /*roomCode*/ 4) banner_changes.roomCode = /*roomCode*/ ctx[2];
    			banner.$set(banner_changes);
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(banner);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let socket = lookup("https://reframed.herokuapp.com/");
    	const urlParams = new URLSearchParams(window.location.search);
    	let dev = urlParams.has("dev");
    	if (dev) socket = lookup("ws://localhost:500");

    	async function socketCheck() {
    		await new Promise((res, rej) => {
    				socket.on("connect", check => {
    					res(check);
    					console.log("Connected to Socket.io!");
    				});

    				socket.on("connect_error", err => {
    					rej("Error connecting to server!");
    				});
    			});
    	}

    	let socketStart = socketCheck();
    	let host;
    	let roomCode;

    	function updateRoomCode({ detail }) {
    		$$invalidate(1, host = detail.host);
    		console.log(detail);
    		$$invalidate(2, roomCode = detail.room);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function game_roomCode_binding(value) {
    		roomCode = value;
    		$$invalidate(2, roomCode);
    	}

    	$$self.$capture_state = () => ({
    		Banner,
    		Game,
    		Error: Error$1,
    		io: lookup,
    		socket,
    		urlParams,
    		dev,
    		socketCheck,
    		socketStart,
    		host,
    		roomCode,
    		updateRoomCode
    	});

    	$$self.$inject_state = $$props => {
    		if ('socket' in $$props) $$invalidate(0, socket = $$props.socket);
    		if ('dev' in $$props) dev = $$props.dev;
    		if ('socketStart' in $$props) $$invalidate(3, socketStart = $$props.socketStart);
    		if ('host' in $$props) $$invalidate(1, host = $$props.host);
    		if ('roomCode' in $$props) $$invalidate(2, roomCode = $$props.roomCode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [socket, host, roomCode, socketStart, updateRoomCode, game_roomCode_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
