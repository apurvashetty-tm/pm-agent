// [MOCK] Fake backend for demos and tests. Drive it by setting `next*` fields, the way the
// prototype's demo drawer drives the web build. Not a production behaviour.
import type { CaseCallingApi, ConfirmResponse } from '../model/api';
import type { CallStatus } from '../model/types';
import { prototypeCallbackSlots } from './prototypeFixtures';

export class MockCaseCallingApi implements CaseCallingApi {
  status: CallStatus = { callId: 'call-1' };
  record: CallStatus | null = null;
  nextConfirm: ConfirmResponse = { kind: 'confirmed' };
  haFree = true;
  transferOk = true;
  nextCallback: 'ok' | 'failed' | 'notReached' = 'ok';
  nextRelease: 'ok' | 'refused' | 'failed' = 'ok';
  submittedRecord: boolean | null = null;
  events: string[] = [];

  async startCall() {
    this.status = { callId: 'call-1' };
    return { callId: 'call-1' };
  }
  async pollCallStatus() {
    return this.status;
  }
  async checkCallRecord() {
    return this.record;
  }
  async confirm(_c: string, kind: string) {
    this.events.push('confirm:' + kind);
    return this.nextConfirm;
  }
  async confirmStatus() {
    return this.nextConfirm;
  }
  async submittedRecordStatus() {
    return this.submittedRecord;
  }
  async checkHealthAdvisor() {
    return { free: this.haFree };
  }
  async transferToHealthAdvisor() {
    return { ok: this.transferOk };
  }
  async skipHa() {}
  async callbackSlots() {
    return prototypeCallbackSlots;
  }
  async scheduleCallback() {
    return this.nextCallback;
  }
  async markUnavailable() {}
  async releaseCase() {
    return this.nextRelease;
  }
  analytics(outcome: string) {
    this.events.push('analytics:' + outcome);
  }
}
