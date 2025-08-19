import routeInfo from 'virtual:route-info';
import { For } from 'solid-js';

function ItemHeader(props: { title: string }) {
  return <div class="b-b text-gray-500 mt-2 pb-1">{props.title}</div>;
}

function Item(props: { title: string; path: string }) {
  return (
    <a class="flex rounded-md p-1 text-gray-700 text-sm" href={props.path}>
      {props.title}
    </a>
  );
}

export function Aside() {
  return (
    <div class="h-full p-2">
      <ItemHeader title="Components" />
      <div class="p-1">
        <For each={routeInfo.filter((v) => v.path.startsWith('component'))}>
          {({ path, info }) => <Item path={`/${path}`} title={info.title} />}
        </For>
      </div>
    </div>
  );
}
