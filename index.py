import asyncio
import random 

BELT_SIZE = 5
PAIRED_WORKERS = 3
SIMULATION_STEPS = 100

class Worker:
    def __init__(self):
        self.holding = [None, None]
        self.required = None

    def validate_required(self, component):
        if component == "A":
            self.required = "B"
        elif component == "B":
            self.required = "A"

    def pick(self, component):
        if component is None or component == "P":
            return print("Invalid component was picked.")
        
        if None in self.holding:
            empty_index = self.holding.index(None)
            self.holding[empty_index] = component
        else:
            print("Worker's hands are full!")

        if "P" not in self.holding:
            self.assemble()
        self.validate_required(component)

    def replace(self, new_component, to_replace_component):
        replace_component_index = self.holding.index(to_replace_component)
        self.holding[replace_component_index] = new_component
        return to_replace_component

    def assemble(self):
        if self.holding[0] is not None and self.holding[1] is not None:
            if self.holding[0] != self.holding[1]:
                self.holding[0] = None
                self.holding[1] = "P"

    def is_empty(self):
        if self.holding[0] is None and self.holding[1] is None:
            return True
        else:
            return False
        
    def remove_finished(self):
        finished_product_index = self.holding.index("P")
        self.holding[finished_product_index] = None
        
    def is_finished(self):
        if "P" in self.holding:
            return True
        else:
            return False


class Belt:
    def __init__(self):
        self.components = [None] * BELT_SIZE
        self.stats = {
            "A": 0,
            "B": 0,
            "finished_product": 0,
            "empty": 0
        }

    async def random_component(self):
        interval = random.uniform(0, 1)
        component = random.choice(["A", "B", None])
        await asyncio.sleep(interval)
        return component

    async def component_on_belt(self):
        new_component = await self.random_component()
        self.components.insert(0, new_component)
        return new_component
    
    def component_off_belt(self):
        last_component = self.components.pop()
        if last_component == "A":
            self.stats["A"] += 1
        elif last_component == "B":
            self.stats["B"] += 1
        elif last_component == "P":
            self.stats["finished_product"] += 1
        else:
            self.stats["empty"] += 1
        return last_component
    
    def replace(self, component, worker_group_index):
        old_component = self.components[worker_group_index]
        self.components[worker_group_index] = component
        return old_component
    


async def main():
    belt = Belt()
    workers = [[Worker(), Worker()] for _ in range(PAIRED_WORKERS)] 
        
    async def simulation():
        for step in range(SIMULATION_STEPS):
            component_placed = await belt.component_on_belt()
            print("-------------------------", "STEP: ", step + 1, "------------------------- \n")
            print("Component placed on belt: ", component_placed, "\n")

            for worker_group_index in range(PAIRED_WORKERS):
                print("BELT: ", belt.components, "\n")
                print("### GROUP: ", worker_group_index)
                group = workers[worker_group_index]
                worker_one = group[0]
                worker_two = group[1]
                component_at_worker_slot = belt.components[worker_group_index]
                skip_worker = False
                print("Component in slot: ", component_at_worker_slot)

                if component_at_worker_slot is not None and component_at_worker_slot != "P":
                    # Give priority to the worker who requires the component to pick
                    if worker_one.required == component_placed and skip_worker is False:
                        worker_one.pick(component=component_placed)
                        belt.replace(component=None, worker_group_index=worker_group_index)
                        skip_worker = True
                        print("Worker 1 requires the component and has picked up.")
                    elif worker_two.required == component_placed  and skip_worker is False:
                        worker_two.pick(component=component_placed)
                        belt.replace(component=None, worker_group_index=worker_group_index)
                        skip_worker = True
                        print("Worker 2 requires the component and has picked up.")

                    # If worker has no component on hand
                    if worker_one.is_empty() == True and skip_worker is False:
                        worker_one.pick(component=component_placed)
                        belt.replace(component=None, worker_group_index=worker_group_index)
                        skip_worker = True
                        print("Worker 1 has picked up the component")
                    elif worker_two.is_empty() == True  and skip_worker is False:
                        worker_two.pick(component=component_placed)
                        belt.replace(component=None, worker_group_index=worker_group_index)
                        skip_worker = True
                        print("Worker 2 has picked up the component")
                elif component_at_worker_slot != "P":
                    # If worker has a finished product and the component placed is None then place the finished product onto the belt
                    if worker_one.is_finished() == True and skip_worker is False:
                        belt.replace(component="P", worker_group_index=worker_group_index)
                        worker_one.remove_finished()
                        skip_worker = True
                        print("Worker 1 has placed the finished product in the empty slot.")
                    elif worker_two.is_finished() == True and skip_worker is False:
                        belt.replace(component="P", worker_group_index=worker_group_index)
                        worker_two.remove_finished()
                        skip_worker = True
                        print("Worker 2 has placed the finished product in the empty slot.")

                print("Worker 1:", worker_one.holding)
                print("Worker 2:",worker_two.holding, "\n")
                
            belt.component_off_belt()
                
    await simulation()

    print("-------------------------", "SUMMARY", "------------------------- \n")
    print(belt.stats)


asyncio.run(main())