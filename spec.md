#Wat Language Spec

Wat was designed in an attempt to tackle an issue most code golfing languages face.  Most languages make a choice between obscurity and obfuscation, where the language is extremely compact, or very difficult to detect.  Similar to [???](https://esolangs.org/wiki/%3F%3F%3F), Wat can be somewhat easily hidden in normal bodies of text.  Typically this is done with by making a BF substitution language - Wat goes a little beyond this to make some tasks easier.

<table>
	<tbody>
		<tr>
			<td><code>;</code></td>
			<td>Move DP left</td>
		</tr>
		<tr>
			<td><code>:</code></td>
			<td>Move DP right</td>
		</tr>
		<tr>
			<td><code>.</code></td>
			<td>Increment memory location at DP (current cell)</td>
		</tr>
		<tr>
			<td><code>,</code></td>
			<td>Decrement current cell</td>
		</tr>
		<tr>
			<td><code>!</code></td>
			<td>Add cell to output stream as it's ASCII code (<code>65</code> -> <code>A</code>)</td>
		</tr>
		<tr>
			<td><code>(</code></td>
			<td>Move IP to matching <code>)</code> if current cell is 0</td>
		</tr>
		<tr>
			<td><code>)</code></td>
			<td>Move IP to matching <code>(</code> if current cell is not 0</td>
		</tr>
	</tbody>
	<tbody style="font-weight: 700">
		<tr>
			<td><code>]</code></td>
			<td>Add cells of memory as decimals, push result to output stream as ASCII</td>
		</tr>
		<tr>
			<td><code>[</code></td>
			<td>Multiply all non-zero cells of memory as decimals, push result to output stream as ASCII</td>
		</tr>
		<tr>
			<td><code>/</code></td>
			<td>Set all memory cells to 0, move DP to 0</td>
		</tr>
		<tr>
			<td><code>'</code></td>
			<td>Toggle whether all cells are counted in <code>[</code> and <code>]</code> commands, or just cells to the left.  Defaults to all</td>
		</tr>
		<tr>
			<td><code>?</code></td>
			<td>Insert the character immediately preceding the <code>?</code> to the current cell</td>
		</tr>
		<tr>
			<td><code>-</code></td>
			<td>Prompt for input</td>
		</tr>
	</tbody>
</table>

After each command is executed, other than a loop character, the IP (instruction pointer) is incremented.