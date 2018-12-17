import * as escapeStringRegexp from 'escape-string-regexp';
import User from '../models/User';
import Code from '../models/Code';
import Optin, { IOptin } from '../models/Optin';
import Bundle from '../models/Bundle';
import { recordAction } from '../utils/record';
import { compareIds } from '../utils/models';
import { AuthenticationError } from 'apollo-server';

export default {
  Query: {
    async userCodes(
      _: any,
      { filter, search }: { filter?: object; search?: string },
      { user }: { user: any }
    ) {
      if (!user) {
        throw new AuthenticationError('Access denied.');
      }
      const optins: IOptin[] = await Optin.find({
        userId: user.id,
      }).select('bundleId');
      const bundleIds = optins.map(({ bundleId }) => bundleId);
      let options: any = {
        $or: [{ creatorId: user.id }, { bundleId: { $in: bundleIds } }],
      };
      if (search && search.length) {
        const regSearch = new RegExp(escapeStringRegexp(search), 'i');
        const searchOr: any = {
          $or: [
            { name: { $regex: regSearch } },
            { shortcut: { $regex: regSearch } },
          ],
        };
        options = { $and: [options, searchOr] };
      }
      const codes: any[] = await Code.find(options, null, filter);
      return codes.map(code => code.toObject());
    },
    async codes(_: any, { filter = {} }) {
      const codes: any[] = await Code.find({}, null, filter);
      return codes.map(code => code.toObject());
    },
    async code(_: any, { id }: { id: string }) {
      const code: any = await Code.findById(id);
      return code.toObject();
    },
  },
  Mutation: {
    async addCode(
      _: any,
      { input }: { input: object },
      { user }: { user: any }
    ) {
      const code: any = await Code.create({
        ...input,
        creatorId: user && user.id,
      });
      recordAction({
        userId: code.creatorId,
        scope: 'Code',
        action: 'Created',
        properties: code.toRecord(),
      });
      return code.toObject();
    },
    async editCode(
      _: any,
      { id, input }: { id: string; input: object },
      { user }: { user: any }
    ) {
      const code: any = await Code.findById(id);
      if (!compareIds(code.creatorId, user.id)) {
        throw new Error('Can not edit a code which is not your own.');
      }
      Object.assign(code, input);
      await code.save();
      recordAction({
        userId: code.creatorId,
        scope: 'Code',
        action: 'Updated',
        properties: code.toRecord(),
      });
      return code.toObject();
    },
    async cloneCode(_: any, { id }: { id: string }, { user }: { user: any }) {
      const code: any = await Code.findById(id);
      if (!compareIds(code.creatorId, user.id)) {
        throw new Error('Can not clone a code which is not your own.');
      }
      const { _id, ...data }: any = code.toObject();
      const clone: any = await Code.create({
        ...data,
        creatorId: user && user.id,
      });
      recordAction({
        userId: code.creatorId,
        scope: 'Code',
        action: 'Cloned',
        properties: code.toRecord(),
      });
      return clone.toObject();
    },
    async deleteCode(_: any, { id }: { id: string }, { user }: { user: any }) {
      const code: any = await Code.findById(id);
      if (!compareIds(code.creatorId, user.id)) {
        throw new Error('Can not clone a code which is not your own.');
      }
      await code.remove();
      recordAction({
        userId: code.creatorId,
        scope: 'Code',
        action: 'Removed',
        properties: code.toRecord(),
      });
      return code ? code.toObject() : null;
    },
  },
  Code: {
    async creator({ creatorId }: { creatorId?: string }) {
      if (creatorId) {
        const user: any = await User.findById(creatorId);
        return user.toObject();
      }
      return null;
    },
    async bundle({ bundleId }: { bundleId?: string }) {
      if (bundleId) {
        const bundle: any = await Bundle.findById(bundleId);
        return bundle.toObject();
      }
      return null;
    },
  },
};
