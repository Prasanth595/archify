import asyncio
import sys

async def main():
    ready = asyncio.Event()

    async def sibling():
        try:
            print('sibling: started', flush=True)
            ready.set()
            await asyncio.Event().wait()
        finally:
            print('sibling: cleanup start', flush=True)
            await asyncio.sleep(0)
            print('sibling: cleanup done', flush=True)

    async def fail():
        await ready.wait()
        print('failure: raising ValueError', flush=True)
        raise ValueError('boom')

    print('Python:', sys.version.split()[0], flush=True)
    try:
        async with asyncio.TaskGroup() as group:
            group.create_task(sibling())
            group.create_task(fail())
    except* ValueError as errors:
        print('outside group: caught', type(errors).__name__, flush=True)
    print('outside group: continued', flush=True)

asyncio.run(main())
