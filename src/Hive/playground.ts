import { BarEvent, FooEvent } from "src/Events"
import { EventHive } from "./EventHive"


const constraint = {
    fooBarEvents: [FooEvent.type, BarEvent.type],
};

const hive = new EventHive(constraint)

const sub = hive.addListener(FooEvent.type, (event: FooEvent) => { console.log('event: ', event.type) }, 'fooBarEvents')

hive.dispatchEvent(new FooEvent({value: 'bar'}));