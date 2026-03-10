import { apiClient } from '../core/api-client.js';
import { getConfig, getStorageKey } from '../core/config.js';

const STATIC_TOOLS_URL = '/data/tools.json';

function normalizeTool(tool) {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category || 'general',
    description: tool.description || '',
    status: tool.status || 'active'
  };
}

function readLocalTools() {
  const raw = localStorage.getItem(getStorageKey('tools'));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.tools)) return null;
    return parsed.tools.map(normalizeTool);
  } catch {
    return null;
  }
}

function writeLocalTools(tools) {
  localStorage.setItem(
    getStorageKey('tools'),
    JSON.stringify({ updatedAt: new Date().toISOString(), tools: tools.map(normalizeTool) })
  );
}

async function readStaticTools() {
  const response = await fetch(STATIC_TOOLS_URL, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.tools) ? payload.tools.map(normalizeTool) : [];
}

async function readApiTools() {
  const { apiBaseUrl } = getConfig();
  if (!apiBaseUrl) return null;
  const result = await apiClient.get('/tools');
  if (!result.ok || !Array.isArray(result.json?.tools)) return null;
  return result.json.tools.map(normalizeTool);
}

export async function listTools() {
  let tools = await readApiTools();
  if (!tools) tools = readLocalTools();
  if (!tools) tools = await readStaticTools();
  return tools;
}

export async function upsertTool(tool) {
  const normalized = normalizeTool(tool);
  const tools = await listTools();
  const index = tools.findIndex((item) => item.id === normalized.id);

  if (index === -1) tools.push(normalized);
  else tools[index] = normalized;

  writeLocalTools(tools);

  const { apiBaseUrl } = getConfig();
  if (apiBaseUrl) {
    if (index === -1) await apiClient.post('/tools', normalized);
    else await apiClient.put(`/tools/${normalized.id}`, normalized);
  }

  return normalized;
}

export async function removeTool(id) {
  const tools = await listTools();
  const next = tools.filter((item) => item.id !== id);
  writeLocalTools(next);

  const { apiBaseUrl } = getConfig();
  if (apiBaseUrl) await apiClient.delete(`/tools/${id}`);
}

export async function exportToolsJson() {
  const tools = await listTools();
  return JSON.stringify({ updatedAt: new Date().toISOString(), tools }, null, 2);
}
