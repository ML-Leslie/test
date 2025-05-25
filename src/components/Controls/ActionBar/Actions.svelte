<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { userGrid, invalidCells } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/stores/game';
    import { possibleNumberSwitch, possibleNumbers } from '@sudoku/stores/possibleNumbers';
	import { possibleNumberSolver, getOnePossibleNumber } from '@sudoku/solver';
	import { message } from '@sudoku/stores/message';
	import { GRID_COORDS, SUDOKU_SIZE } from '@sudoku/constants';
	import { branchPoints, history, rightNumber, wrongNumber } from '@sudoku/stores/branchPoints';

	$: hintsAvailable = $hints > 0;

	function handleHint() {
		if (hintsAvailable) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			userGrid.applyHint($cursor);
		}
	}

	function handleLearn() {
		const [{idx, value}, msg] = possibleNumberSolver($userGrid);
		const [row, col] = GRID_COORDS[idx];
		$message = msg;
		userGrid.set({ y: row, x: col } , value);
	}

	$: trigBackTracking = $branchPoints.length > 0 && $invalidCells.length > 0;
	function handleBackTracking() {
		let junction = $branchPoints.pop();
		let wrongGrid = $history[junction];
		let wrongNumberValue = $userGrid[wrongGrid.y][wrongGrid.x];
		wrongNumber.set(wrongNumberValue);
		cursor.set(wrongGrid.x, wrongGrid.y);
		let toremove = $history.slice(junction, $history.length);
		toremove.forEach(pos => {
			userGrid.set(pos, 0);
			history.remove(pos);
		});
		let rightNumberValue = getOnePossibleNumber($userGrid, $cursor.y * SUDOKU_SIZE + $cursor.x ).find(item => item !== wrongNumberValue);
		rightNumber.set(rightNumberValue);
		possibleNumberSwitch.on();
		$message = "BackTracking!\nYour wrong number is " + wrongNumberValue +" and the another possible number is " + rightNumberValue;
	}

	let isTest = false;
	let testFuncName = '';

	
	function handleTest(e) {
        if (e.key === 'Enter') {
            isTest = false;
			$message = eval(testFuncName.trim());
        } else if (e.key === 'Escape') {
            isTest = false;
        }		
	}
</script>
<div class="action-buttons space-x-3">

	<button class="btn btn-round relative" disabled={$gamePaused} on:click={()=>{isTest = true}} title="Test">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
		</svg>
		<input class="test-input absolute mb-2 w-64 px-3 py-2 rounded-lg border border-gray-300 shadow-lg bg-white transition-all z-10 focus:outline-none focus:ring-2 focus:ring-primary" 
			class:visible={isTest} class:invisible={!isTest} bind:value={testFuncName} on:keydown={handleTest} placeholder="Input the test function name and enter to run"
		/>
	</button>	

	<button class="btn btn-round btn-badge" disabled={$gamePaused || !trigBackTracking} on:click={handleBackTracking} title="BackTracking">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path troke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
		</svg>
		{#if trigBackTracking}
			<span class="badge tracking-tighter badge-primary">{$branchPoints.length}</span>
		{/if}
	</button>

	<button class="btn btn-round" disabled={$gamePaused} on:click={handleLearn} title="Learn">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
		</svg>
	</button>

	{#if $possibleNumberSwitch}
		<button class="btn btn-round" disabled={$gamePaused} on:click={possibleNumberSwitch.off} title="Hide Possible Numbers">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
			</svg>
		</button>
	{:else}
		<button class="btn btn-round" disabled={$gamePaused} on:click={possibleNumberSwitch.on} title="Show Possible Numbers">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
			</svg>
		</button>
	{/if}

	<button class="btn btn-round" disabled={$gamePaused} title="Undo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={$gamePaused} title="Redo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	<button class="btn btn-round btn-badge" disabled={$keyboardDisabled || !hintsAvailable || $userGrid[$cursor.y][$cursor.x] !== 0} on:click={handleHint} title="Hints ({$hints})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>

		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

</div>


<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}

	.test-input {
		left: 33.3%;
		font-size:large
	}

</style>